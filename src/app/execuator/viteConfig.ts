import { PromptAnswers } from '../prompts';
import { parse, type AcornComment } from 'acorn';
import fs from 'fs';
import type { ImportDeclaration, Program } from 'estree';
import { modifyString, type StringBuilder } from './stringModification';

export const parseCode = (code: string) => {
  const comments: AcornComment[] = [];
  const program = parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    onComment: comments,
  });
  program.comments = comments;
  return program;
};

export const insertImports = (estree: Program, builder: StringBuilder, codeToInsert: string) => {
  // find last import from latest import block
  let lastImport: ImportDeclaration | null = null;
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
      if (firstComment.start === 0) {
        insertPos = firstComment.end;
      }
    }
  } else {
    // Or add to the last import
    insertPos = lastImport.end + 1;
  }
  builder.insert(insertPos, codeToInsert);
};

export const insertVitePlugins = (
  estree: Program,
  builder: StringBuilder,
  codeToInsert: string,
) => {
  for (const node of estree.body) {
    // find 'config'
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
      // find 'config.plugins'
      for (const property of decl.init.properties) {
        if (
          property.type !== 'Property' ||
          property.key.type !== 'Identifier' ||
          property.key.name !== 'plugins' ||
          property.value.type !== 'ArrayExpression'
        ) {
          continue;
        }
        // find last element of 'config.plugins'
        let insertPos = -1;
        for (const element of property.value.elements) {
          if (element) {
            insertPos = element.end + 1;
            // trailing comma
            if (builder.source[insertPos + 1] === ',') {
              insertPos++;
            }
          }
        }
        if (insertPos === -1) {
          insertPos = property.value.start + 1;
          builder.insert(insertPos, codeToInsert + `\n  `);
        } else {
          builder.insert(insertPos, codeToInsert);
        }
      }
    }
  }
};

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

export const patchRendererConfigFrom = async (path: string, config: PromptAnswers) => {
  const buffer = await fs.promises.readFile(path);
  const viteConfig = buffer.toString();
  const patchedViteConfig = patchRendererConfig(viteConfig, config);
  await fs.promises.writeFile(path, patchedViteConfig);
};
