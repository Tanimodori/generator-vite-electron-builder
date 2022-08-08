import { applyEdits, modify, parseTree } from 'jsonc-parser';

export const editJsonc = (...args: Parameters<typeof modify>) => {
  const edits = modify(...args);
  return applyEdits(args[0], edits);
};

export const parseJsonc = (json: string) => {
  return parseTree(json);
};
