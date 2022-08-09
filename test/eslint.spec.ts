import { eslintPrettierExtends, eslintrcPath, patchEslintrc } from 'src/app/execuator/eslint';
import { PromptAnswers } from 'src/app/prompts';
import { beforeAll, beforeEach, describe, expect, it, TestFunction } from 'vitest';
import { BeforeEachFunction } from './types';
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

  beforeEach(((context) => {
    context.eslintrc = eslintrc;
  }) as BeforeEachFunction<LocalTestContext> as BeforeEachFunction);

  it('should edit .eslintrc correctly', ((context) => {
    const patchedCode = patchEslintrc(context.eslintrc, configWithEslintPrettier);
    expect(eslintPrettierExtends.every((item) => patchedCode.includes(item))).toBe(true);
  }) as TestFunction<LocalTestContext> as TestFunction);
});
