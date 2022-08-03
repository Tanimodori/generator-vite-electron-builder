import { PromptAnswers } from '../prompts';
import { parse } from 'acorn';
import fs from 'fs';

export const parseCode = (code: string) => {
  return parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });
};

export const patchRendererConfig = (code: string, config: PromptAnswers): string => {
  const estree = parseCode(code);
  if (estree.type !== 'Program') {
    throw new Error('patchRendererConfig: Vite config not valid');
  }
  // Why acorn not have its type defination?
  return '';
};

export const patchRendererConfigFrom = async (path: string, config: PromptAnswers) => {
  const buffer = await fs.promises.readFile(path);
  const viteConfig = buffer.toString();
  const patchedViteConfig = patchRendererConfig(viteConfig, config);
  await fs.promises.writeFile(path, patchedViteConfig);
};
