import { parseTree } from 'jsonc-parser';
import { PromptAnswers } from '../prompts';
import { transformFile } from './fs';

/** Transform string */
export const patchPackageJson = (code: string, config: PromptAnswers) => {
  const node = parseTree(code);
  console.log(node);
  return code;
};

/** Transform file */
export const patchPackageJsonFrom = async (path: string, config: PromptAnswers) => {
  await transformFile(path, (src) => patchPackageJson(src, config));
};
