import { eslintPrettierExtends, eslintrcPath, patchEslintrc } from 'src/eslint';
import { PromptAnswers } from 'src/app/prompts';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadOriginalRepoFile } from './utils';

const configNoop: PromptAnswers = {
  id: 'test',
  eslint: false,
  prettier: false,
  prettierStyle: 'noop',
  css: [],
  test: [],
  devtools: 'noop',
};
const configWithEslintPrettier: PromptAnswers = {
  ...configNoop,
  eslint: true,
  prettier: true,
};

describe('.eslintrc Unit Test (Actual)', async () => {
  interface LocalTestContext {
    eslintrc: string;
  }

  let eslintrc = '';

  beforeAll(async () => {
    eslintrc = await loadOriginalRepoFile(eslintrcPath.index);
  });

  beforeEach<LocalTestContext>((context) => {
    context.eslintrc = eslintrc;
  });

  it<LocalTestContext>('should edit .eslintrc correctly', (context) => {
    const patchedCode = patchEslintrc(context.eslintrc, configWithEslintPrettier);
    expect(eslintPrettierExtends.every((item) => patchedCode.includes(item))).toBe(true);
  });
});
