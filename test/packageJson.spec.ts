import path from 'path';
import fs from 'fs';
import { REPO_DIR, TEST_NAME_ORIGINAL } from './setup';
import { beforeAll, beforeEach, describe, it } from 'vitest';
import { patchPackageJson } from 'src/app/execuator/packageJson';
import { PromptAnswers } from 'src/app/prompts';
import { BeforeEachFunction } from './types';

const configNoop: PromptAnswers = {
  id: 'test',
  eslint: false,
  prettier: false,
  prettierStyle: 'noop',
  css: [],
  test: [],
  devtools: 'noop',
};

const configFull: PromptAnswers = {
  id: 'test',
  eslint: true,
  prettier: true,
  prettierStyle: 'noop',
  css: ['windicss', 'less', 'sass'],
  test: ['unit', 'e2e'],
  devtools: 'online',
};

describe('package.json Unit Test (Actual)', async () => {
  interface LocalTestContext {
    packageJson: string;
  }

  let packageJson = '';

  beforeAll(async () => {
    // construct viteConfigPath
    const packageJsonPath = path.resolve(REPO_DIR, TEST_NAME_ORIGINAL, 'package.json');
    // read file content
    const buffer = await fs.promises.readFile(packageJsonPath);
    packageJson = buffer.toString();
  });

  beforeEach(((context) => {
    context.packageJson = packageJson;
  }) as BeforeEachFunction<LocalTestContext> as BeforeEachFunction);

  it('should read package.json', async () => {
    patchPackageJson(packageJson, configNoop);
  });
});
