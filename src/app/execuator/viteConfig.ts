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
    insertPos = lastImport.end;
  }
  builder.insert(insertPos, codeToInsert);
};

export const insertVitePlugins = (
  estree: Program,
  builder: StringBuilder,
  codeToInsert: string,
) => {
  console.log('Not implemented');
};

export const patchRendererConfig = (code: string, config: PromptAnswers) => {
  // modify only tailwindcss is included
  if (config.css.indexOf('tailwindcss') === -1) {
    return code;
  }
  const estree = parseCode(code);
  const builder = modifyString(code);
  insertImports(estree, builder, `\nimport WindiCSS from 'vite-plugin-windicss';`);
  return builder.apply();
};

export const patchRendererConfigFrom = async (path: string, config: PromptAnswers) => {
  const buffer = await fs.promises.readFile(path);
  const viteConfig = buffer.toString();
  const patchedViteConfig = patchRendererConfig(viteConfig, config);
  await fs.promises.writeFile(path, patchedViteConfig);
};
