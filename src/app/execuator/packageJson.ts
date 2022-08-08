import { findNodeAtLocation } from 'jsonc-parser';
import { PromptAnswers } from '../prompts';
import { transformFile } from './fs';
import { editJsonc, parseJsonc } from './jsonc';

export const featDeps = {
  eslint: ['eslint', '@typescript-eslint/eslint-plugin', 'eslint-plugin-vue'],
  prettier: ['prettier'],
  eslintPrettier: ['eslint-config-prettier', 'eslint-plugin-prettier'],
  test: ['vitest'],
  unit: ['@vue/test-utils', 'happy-dom'],
  e2e: ['playwright'],
  windicss: ['windicss', 'vite-plugin-windicss'],
  less: ['less'],
  sass: ['sass'],
  devtoolOnline: ['electron-devtools-installer'],
};

/** return a map of dep should be whether installed or removed */
export const buildDevMods = (config: PromptAnswers) => {
  const depMods: Record<string, boolean> = {};

  /** Mark a dep should be installed or removed */
  const markDep = (value: boolean, ...dicts: string[][]) => {
    dicts.forEach((dict) => {
      dict.forEach((key) => (depMods[key] = value));
    });
  };

  // eslint & prettier
  markDep(config.eslint, featDeps.eslint);
  markDep(config.prettier, featDeps.prettier);
  markDep(config.eslint && config.prettier, featDeps.eslintPrettier);

  // test
  markDep(config.test.length > 0, featDeps.test);
  markDep(config.test.includes('unit'), featDeps.unit);
  markDep(config.test.includes('e2e'), featDeps.e2e);

  // CSS
  markDep(config.css.includes('windicss'), featDeps.windicss);
  markDep(config.css.includes('less'), featDeps.less);
  markDep(config.css.includes('sass'), featDeps.sass);

  // devtool
  markDep(config.devtools.includes('online'), featDeps.devtoolOnline);

  return depMods;
};

/** Extract Original devDependencies */
export const extractOriginalDevDeps = (code: string): string[] => {
  const original = parseJsonc(code);
  for (const property of original?.children || []) {
    if (property?.children?.[0]?.value !== 'devDependencies') {
      continue;
    }
    const devDepNodes = property?.children?.[1]?.children || [];
    return devDepNodes.map((x) => x.children?.[0]?.value).filter((x) => !!x);
  }
  return [];
};

/** patch 'devDependencies' */
export const patchDevDependencies = (code: string, config: PromptAnswers) => {
  const depMods = buildDevMods(config);
  const originalDevDeps = extractOriginalDevDeps(code);
  const depAddition: string[] = [];

  let patchedCode = code;
  for (const key in depMods) {
    const keyInstalled = originalDevDeps.includes(key);
    if (depMods[key] && !keyInstalled) {
      // devDep need to be installed
      depAddition.push(key);
    } else if (!depMods[key] && keyInstalled) {
      // devDep need to be uninstalled
      patchedCode = editJsonc(patchedCode, ['devDependencies', key], undefined, {});
    }
  }

  return { code: patchedCode, addition: depAddition };
};

export const featScripts = {
  test: {
    index: ['test'],
    unit: ['test:main', 'test:preload', 'test:renderer'],
    e2e: ['test:e2e'],
  },
};

/** patch 'scripts' */
export const patchScripts = (code: string, config: PromptAnswers) => {
  let patchedCode = code;
  if (config.test.length > 0) {
    const node = parseJsonc(code);
    if (!node) {
      throw new Error('Cannot patch package.json scripts');
    }
    const allTestTasksStr: string = findNodeAtLocation(node, ['scripts', 'test'])?.value || '';
    let allTestTasks = allTestTasksStr.split('&&').map((x) => x.trim());

    // filter out test commands and tasks
    for (const feat of ['unit', 'e2e'] as const) {
      if (!config.test.includes(feat)) {
        const featTaskRunCmds = featScripts.test[feat].map((task) => {
          patchedCode = editJsonc(patchedCode, ['scripts', task], undefined, {});
          return `npm run ${task}`;
        });
        allTestTasks = allTestTasks.filter((x) => !featTaskRunCmds.includes(x));
      }
    }

    patchedCode = editJsonc(
      patchedCode,
      ['scripts', featScripts.test.index[0]],
      allTestTasks.join(' && '),
      {},
    );
  } else {
    // no test
    Object.values(featScripts.test)
      .flat()
      .forEach((task) => {
        patchedCode = editJsonc(patchedCode, ['scripts', task], undefined, {});
      });
  }
  return patchedCode;
};

/** patch 'name' */
export const patchName = (code: string, config: PromptAnswers) => {
  return editJsonc(code, ['name'], config.id, {});
};

/** Transform string */
export const patchPackageJson = (code: string, config: PromptAnswers) => {
  const result = patchDevDependencies(code, config);
  result.code = patchScripts(result.code, config);
  result.code = patchName(result.code, config);
  return result;
};

/** Transform file */
export const patchPackageJsonFrom = async (path: string, config: PromptAnswers) => {
  let addition: string[] = [];
  await transformFile(path, (src) => {
    const result = patchPackageJson(src, config);
    addition = result.addition;
    return result.code;
  });
  return addition;
};
