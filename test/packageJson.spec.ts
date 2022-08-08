import path from 'path';
import fs from 'fs';
import { REPO_DIR, TEST_NAME_ORIGINAL } from './setup';
import { beforeAll, beforeEach, describe, it, TestFunction, expect } from 'vitest';
import {
  buildDevMods,
  featDeps,
  featScripts,
  patchDevDependencies,
  patchScripts,
} from 'src/app/execuator/packageJson';
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
  const allFeatPackages = Object.values(featDeps).flat();
  const allTestTasks = Object.values(featScripts.test).flat();

  const getConfigSection = (json: string, section: string) => {
    const endPattern = '\n  },\n';
    const firstIndex = json.lastIndexOf(`"${section}"`);
    const lastIndex = json.indexOf(endPattern, firstIndex) + endPattern.length;
    return json.substring(firstIndex, lastIndex);
  };

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

  it('should construct depmod correctly', () => {
    expect(Object.values(buildDevMods(configNoop)).every((x) => x === false)).toBe(true);
    expect(Object.values(buildDevMods(configFull)).every((x) => x === true)).toBe(true);
  });

  it('should edit package.json devDeps correctly', ((context) => {
    const noopResult = patchDevDependencies(context.packageJson, configNoop);
    const noopDevDep = getConfigSection(noopResult.code, 'devDependencies');
    expect(allFeatPackages.every((key) => !noopDevDep.includes(key))).toBe(true);
    expect(noopResult.addition.length).toBe(0);

    const fullResult = patchDevDependencies(context.packageJson, configFull);
    const fullDevDep = getConfigSection(fullResult.code, 'devDependencies');
    expect(
      allFeatPackages.every((key) => fullDevDep.includes(key) || fullResult.addition.includes(key)),
    ).toBe(true);
  }) as TestFunction<LocalTestContext> as TestFunction);

  it('should edit package.json scripts correctly', async () => {
    const noopResult = patchScripts(packageJson, configNoop);
    const noopScript = getConfigSection(noopResult, 'scripts');
    expect(noopScript).toSatisfy((scripts: string) =>
      allTestTasks.every((task) => !scripts.includes(task)),
    );

    const fullResult = patchScripts(packageJson, configFull);
    const fullScript = getConfigSection(fullResult, 'scripts');
    expect(fullScript).toSatisfy((scripts: string) =>
      allTestTasks.every((task) => scripts.includes(task)),
    );
  });
});
