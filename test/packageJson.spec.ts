import { beforeAll, beforeEach, describe, it, expect } from 'vitest';
import {
  buildDevMods,
  featDeps,
  featScripts,
  packageJsonPath,
  patchDevDependencies,
  patchName,
  patchScripts,
} from 'src/app/execuator/packageJson';
import { PromptAnswers } from 'src/app/prompts';
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
    packageJson = await loadOriginalRepoFile(packageJsonPath);
  });

  beforeEach<LocalTestContext>((context) => {
    context.packageJson = packageJson;
  });

  it('should construct depmod correctly', () => {
    expect(Object.values(buildDevMods(configNoop)).every((x) => x === false)).toBe(true);
    expect(Object.values(buildDevMods(configFull)).every((x) => x === true)).toBe(true);
  });

  it<LocalTestContext>('should edit package.json devDeps correctly', (context) => {
    const noopResult = patchDevDependencies(context.packageJson, configNoop);
    const noopDevDep = getConfigSection(noopResult.code, 'devDependencies');
    expect(allFeatPackages.every((key) => !noopDevDep.includes(key))).toBe(true);
    expect(noopResult.addition.length).toBe(0);

    const fullResult = patchDevDependencies(context.packageJson, configFull);
    const fullDevDep = getConfigSection(fullResult.code, 'devDependencies');
    expect(
      allFeatPackages.every((key) => fullDevDep.includes(key) || fullResult.addition.includes(key)),
    ).toBe(true);
  });

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

  it('should edit package.json name correctly', async () => {
    const noopResult = patchName(packageJson, configNoop);
    expect(noopResult.includes(`"name": "${configNoop.id}",`)).toBe(true);
  });
});
