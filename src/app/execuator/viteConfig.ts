import { PromptAnswers } from '../prompts';
import { modifyString, type StringBuilder } from './stringModification';
import { TSESTree } from '@typescript-eslint/types';
import { parseCode } from './typescript';
import { transformFile } from './fs';
import path from 'path';

export const viteConfigPath = {
  renderer: 'packages/renderer/vite.config.js',
  preload: 'packages/preload/vite.config.js',
  main: 'packages/main/vite.config.js',
};

/** Find the position to insert imports */
export const findInsertImportsPos = (estree: TSESTree.Program): number => {
  // find last import from latest import block
  let lastImport: TSESTree.ImportDeclaration | null = null;
  for (const statement of estree.body) {
    if (statement.type === 'ImportDeclaration') {
      lastImport = statement;
    }
  }
  // determine where to insert
  let insertPos = 0;
  if (!lastImport) {
    // If no import found, add after first line comment
    if (estree.comments && estree.comments.length > 0) {
      const firstComment = estree.comments[0];
      if (firstComment.range[0] === 0) {
        insertPos = firstComment.range[1];
      }
    }
  } else {
    // Or add to the last import
    insertPos = lastImport.range[1] + 1;
  }
  return insertPos;
};

/** Insert imports code */
export const insertImports = (
  estree: TSESTree.Program,
  builder: StringBuilder,
  codeToInsert: string,
) => {
  builder.insert(findInsertImportsPos(estree), codeToInsert);
};

/** Find 'config'  */
const findConfigDeclaration = (program: TSESTree.Program) => {
  for (const node of program.body) {
    if (node.type === 'VariableDeclaration') {
      const decl = node.declarations[0];
      if (
        decl.id.type !== 'Identifier' ||
        decl.id.name !== 'config' ||
        !decl.init ||
        decl.init.type !== 'ObjectExpression'
      ) {
        continue;
      }
      return decl.init;
    }
  }
  return null;
};

/** Find 'config.plugins' */
const findPlugins = (config: TSESTree.ObjectExpression) => {
  for (const property of config.properties) {
    if (
      property.type !== 'Property' ||
      property.key.type !== 'Identifier' ||
      property.key.name !== 'plugins' ||
      property.value.type !== 'ArrayExpression'
    ) {
      continue;
    }
    return property.value;
  }
  return null;
};

/** Find last element of 'config.plugins' */
const findLastPluginPos = (plugins: TSESTree.ArrayExpression, src: string) => {
  let insertPos = -1;
  for (const element of plugins.elements) {
    if (element) {
      insertPos = element.range[1] + 1;
      // trailing comma
      if (src[insertPos + 1] === ',') {
        insertPos++;
      }
    }
  }
  if (insertPos === -1) {
    insertPos = plugins.range[0] + 1;
    return { pos: insertPos, pluginEmpty: true };
  } else {
    return { pos: insertPos, pluginEmpty: false };
  }
};

/** Find the position to insert vite plugins */
export const findInsertVitePluginsPos = (
  estree: TSESTree.Program,
  src: string,
): { pos: number; pluginEmpty: boolean } => {
  const configDecl = findConfigDeclaration(estree);
  if (!configDecl) {
    throw new Error('Cannot find vite config while insert plugins.');
  }
  const plugins = findPlugins(configDecl);
  if (!plugins) {
    throw new Error('Cannot find plugin section while insert plugins.');
  }
  return findLastPluginPos(plugins, src);
};

/** Insert vite plugins */
export const insertVitePlugins = (
  estree: TSESTree.Program,
  builder: StringBuilder,
  codeToInsert: string,
) => {
  const { pos, pluginEmpty } = findInsertVitePluginsPos(estree, builder.source);
  if (pluginEmpty) {
    codeToInsert += `\n  `;
  }
  builder.insert(pos, codeToInsert);
};

export const insertWindicssPlugins = (estree: TSESTree.Program, builder: StringBuilder) => {
  insertImports(estree, builder, `import WindiCSS from 'vite-plugin-windicss';\n`);
  insertVitePlugins(estree, builder, `\n    WindiCSS(),`);
};

/** Find 'config.test' */
const findTest = (config: TSESTree.ObjectExpression, source: string) => {
  const result = {
    property: null as TSESTree.PropertyComputedName | TSESTree.PropertyNonComputedName | null,
    value: null as TSESTree.ObjectExpression | null,
    startPos: config.range[0] + 1,
    endPos: -1,
  };
  for (const property of config.properties) {
    if (result.property && result.endPos === -1) {
      result.endPos = property.range[0];
    }
    if (
      property.type !== 'Property' ||
      property.key.type !== 'Identifier' ||
      property.key.name !== 'test' ||
      property.value.type !== 'ObjectExpression'
    ) {
      continue;
    }
    result.property = property;
    result.value = property.value;
    result.startPos = property.range[0];
    if (source[result.startPos] === ',') {
      result.startPos++; // trailing comma
    }
  }
  if (result.endPos === -1) {
    result.startPos -= 2; // leading space
    result.endPos = config.range[1] - 1;
  }
  return result;
};

const findTestEnvironment = (testDecl: TSESTree.ObjectExpression) => {
  for (const property of testDecl.properties) {
    if (
      property.type !== 'Property' ||
      property.key.type !== 'Identifier' ||
      property.key.name !== 'environment' ||
      property.value.type !== 'Literal' ||
      property.value.value !== 'happy-dom'
    ) {
      continue;
    }
    return property;
  }
  return null;
};

export const patchViteConfigTest = (
  estree: TSESTree.Program,
  builder: StringBuilder,
  config: PromptAnswers,
) => {
  const configDecl = findConfigDeclaration(estree);
  if (!configDecl) {
    throw new Error('Cannot find vite config while patching test.');
  }
  const findTestResult = findTest(configDecl, builder.source);
  const testDecl = findTestResult.property;
  if (!testDecl || !findTestResult.value) {
    if (config.test.length > 0) {
      throw new Error('Cannot find test section while patching test.');
    } else {
      return;
    }
  }

  if (config.test.length === 0) {
    // no test, remove the section
    builder.remove(findTestResult.startPos, findTestResult.endPos);
  } else {
    if (!config.test.includes('unit')) {
      // no unit test, change 'environment' to 'node'
      const envDecl = findTestEnvironment(findTestResult.value);
      if (envDecl) {
        builder.replace(envDecl.value.range[0], envDecl.value.range[1], `'node'`);
      }
    }
  }
};

/** Transform string */
export const patchViteConfig = (
  code: string,
  config: PromptAnswers,
  type: 'main' | 'preload' | 'renderer',
) => {
  const estree = parseCode(code);
  const builder = modifyString(code);
  if (type === 'renderer') {
    if (config.css.indexOf('windicss') !== -1) {
      insertWindicssPlugins(estree, builder);
    }
  }
  patchViteConfigTest(estree, builder, config);
  return builder.apply();
};

/** Transform file */
export const patchViteConfigFrom = async (dest: string, config: PromptAnswers) => {
  let key: keyof typeof viteConfigPath;
  for (key in viteConfigPath) {
    await transformFile(path.resolve(dest, viteConfigPath[key]), (src) =>
      patchViteConfig(src, config, key),
    );
  }
};
