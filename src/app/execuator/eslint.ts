import { findNodeAtLocation } from 'jsonc-parser';
import { editJsonc, parseJsonc } from './jsonc';

export const eslintrcPath = '.eslintrc.json';

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
