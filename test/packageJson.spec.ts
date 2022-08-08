import path from 'path';
import fs from 'fs';
import { REPO_DIR, TEST_NAME_ORIGINAL } from './setup';
import { describe, it } from 'vitest';
import { patchPackageJson } from 'src/app/execuator/packageJson';
import { PromptAnswers } from 'src/app/prompts';

const configNoop: PromptAnswers = {
  id: 'test',
  eslint: false,
  prettier: false,
  prettierStyle: 'noop',
  css: [],
  test: [],
  devtools: 'noop',
};

describe('package.json Unit Test (Actual)', async () => {
  it('should read package.json', async () => {
    // construct viteConfigPath
    const packageJsonPath = path.resolve(REPO_DIR, TEST_NAME_ORIGINAL, 'package.json');
    // read file content
    const buffer = await fs.promises.readFile(packageJsonPath);
    const packageJson = buffer.toString();

    patchPackageJson(packageJson, configNoop);
  });
});
