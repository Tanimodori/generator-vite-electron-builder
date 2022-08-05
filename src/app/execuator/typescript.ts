import { parse } from '@typescript-eslint/typescript-estree';

export const parseCode = (code: string) => {
  return parse(code, { comment: true, loc: true, range: true });
};
