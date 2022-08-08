import { findNodeAtLocation } from 'jsonc-parser';
import { parseJsonc } from './jsonc';

/** Append eslint extends */
export const insertExtends = (code: string, items: string[]) => {
  const node = parseJsonc(code);
  if (!node) {
    throw new Error('Cannot insert eslint extends');
  }
  const originalExtends = findNodeAtLocation(node, ['extends']);
  console.log(originalExtends);
};
