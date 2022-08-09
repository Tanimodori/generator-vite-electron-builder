import { findNodeAtLocation } from 'jsonc-parser';
import path from 'path';
import fs from 'fs';
import { PromptAnswers } from '../prompts';
import { transformFile } from './fs';
import { editJsonc, parseJsonc } from './jsonc';

export const eslintrcPath = {
  index: '.eslintrc.json',
  renderer: 'packages/renderer/.eslintrc.json',
};

export const eslintPrettierExtends = ['plugin:prettier/recommended'];

/** Append eslint extends */
export const insertExtends = (code: string, items: string[]) => {
  const node = parseJsonc(code);
  if (!node) {
    throw new Error('Error parsing eslint config while inserting eslint extends');
  }
  const originalExtends = findNodeAtLocation(node, ['extends']);
  if (!originalExtends || originalExtends.type !== 'array' || !originalExtends.children) {
    throw new Error('Error parsing eslint config while inserting eslint extends');
  }
  let originalExtendsCount = originalExtends.children.length;
  let result = code;
  for (const item of items) {
    result = editJsonc(result, ['extends', ++originalExtendsCount], item, {
      isArrayInsertion: true,
    });
  }
  console.log(result);
  return result;
};

/** Transform string */
export const patchEslintrc = (code: string, config: PromptAnswers) => {
  if (config.eslint && config.prettier) {
    return insertExtends(code, eslintPrettierExtends);
  } else {
    return code;
  }
};

/** Transform file */
export const patchEslintrcFrom = async (dest: string, config: PromptAnswers) => {
  for (const eslintrcPathItem in Object.values(eslintrcPath)) {
    const finalPath = path.resolve(dest, eslintrcPathItem);
    if (!config.eslint) {
      // no eslint
      await fs.promises.rm(finalPath);
    } else {
      await transformFile(finalPath, (src) => patchEslintrc(src, config));
    }
  }
};
