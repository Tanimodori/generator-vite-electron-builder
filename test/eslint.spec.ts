import { eslintrcPath, insertExtends } from 'src/app/execuator/eslint';
import { beforeAll, beforeEach, describe, expect, it, TestFunction } from 'vitest';
import { BeforeEachFunction } from './types';
import { loadOriginalRepoFile } from './utils';

describe('.eslintrc Unit Test (Actual)', async () => {
  interface LocalTestContext {
    eslintrc: string;
  }

  let eslintrc = '';

  beforeAll(async () => {
    eslintrc = await loadOriginalRepoFile(eslintrcPath);
  });

  beforeEach(((context) => {
    context.eslintrc = eslintrc;
  }) as BeforeEachFunction<LocalTestContext> as BeforeEachFunction);

  it('should edit .eslintrc correctly', ((context) => {
    insertExtends(context.eslintrc, ['plugin:prettier/recommended']);
  }) as TestFunction<LocalTestContext> as TestFunction);
});
