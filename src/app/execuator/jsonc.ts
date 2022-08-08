import { applyEdits, modify, parseTree } from 'jsonc-parser';

export const editJsonc = (...args: Parameters<typeof modify>) => {
  args[3] = {
    formattingOptions: {
      tabSize: 2,
      insertSpaces: true,
    },
  };
  const edits = modify(...args);
  return applyEdits(args[0], edits);
};

export const parseJsonc = (json: string) => {
  return parseTree(json);
};
