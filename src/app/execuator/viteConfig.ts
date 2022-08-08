import { PromptAnswers } from '../prompts';
import { modifyString, type StringBuilder } from './stringModification';
import { TSESTree } from '@typescript-eslint/types';
import { parseCode } from './typescript';
import { transformFile } from './fs';

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
  const config = findConfigDeclaration(estree);
  if (!config) {
    throw new Error('Cannot find config while insert VitePlugins.');
  }
  const plugins = findPlugins(config);
  if (!plugins) {
    throw new Error('Cannot find plugins while insert VitePlugins.');
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

/** Transform string */
export const patchRendererConfig = (code: string, config: PromptAnswers) => {
  // modify only windicss is included
  if (config.css.indexOf('windicss') === -1) {
    return code;
  }
  const estree = parseCode(code);
  const builder = modifyString(code);
  insertImports(estree, builder, `import WindiCSS from 'vite-plugin-windicss';\n`);
  insertVitePlugins(estree, builder, `\n    WindiCSS(),`);
  return builder.apply();
};

/** Transform file */
export const patchRendererConfigFrom = async (path: string, config: PromptAnswers) => {
  await transformFile(path, (src) => patchRendererConfig(src, config));
};
