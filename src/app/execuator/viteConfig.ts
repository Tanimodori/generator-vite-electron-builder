import { PromptAnswers } from '../prompts';
import { parse } from 'acorn';
import fs from 'fs';
import type { ImportDeclaration } from 'estree';

export const parseCode = (code: string) => {
  return parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });
};

export const patchRendererConfig = (code: string, config: PromptAnswers) => {
  // modify only tailwindcss is included
  if (config.css.indexOf('tailwindcss') === -1) {
    return code;
  }
  const estree = parseCode(code);
  // find last import from latest import block
  let lastImport: ImportDeclaration | null = null;
  for (const statement of estree.body) {
    if (statement.type === 'ImportDeclaration') {
      lastImport = statement;
    }
  }
};

export const patchRendererConfigFrom = async (path: string, config: PromptAnswers) => {
  const buffer = await fs.promises.readFile(path);
  const viteConfig = buffer.toString();
  const patchedViteConfig = patchRendererConfig(viteConfig, config);
  await fs.promises.writeFile(path, patchedViteConfig);
};
