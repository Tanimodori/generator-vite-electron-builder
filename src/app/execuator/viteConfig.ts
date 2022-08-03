import { PromptAnswers } from '../prompts';
import { parse } from 'acorn';
import fs from 'fs';

export const parseCode = (code: string) => {
  return parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });
};

export const patchRendererConfig = (code: string, config: PromptAnswers) => {
  const estree = parseCode(code);
  return code;
};

export const patchRendererConfigFrom = async (path: string, config: PromptAnswers) => {
  const buffer = await fs.promises.readFile(path);
  const viteConfig = buffer.toString();
  const patchedViteConfig = patchRendererConfig(viteConfig, config);
  await fs.promises.writeFile(path, patchedViteConfig);
};
