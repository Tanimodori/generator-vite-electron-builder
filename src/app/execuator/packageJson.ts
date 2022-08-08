import { PromptAnswers } from '../prompts';
import { transformFile } from './fs';
import { editJsonc, parseJsonc } from './jsonc';

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
  const eslintDeps = ['eslint', '@typescript-eslint/eslint-plugin', 'eslint-plugin-vue'];
  const prettierDeps = ['prettier'];
  const eslintPrettierDeps = ['eslint-config-prettier', 'eslint-plugin-prettier'];
  markDep(config.eslint, eslintDeps);
  markDep(config.prettier, prettierDeps);
  markDep(config.eslint && config.prettier, eslintPrettierDeps);

  // test
  const testDeps = ['vitest'];
  const unitDeps = ['@vue/test-utils', 'happy-dom'];
  const e2eDeps = ['playwright'];
  markDep(config.test.length > 0, testDeps);
  markDep(config.test.includes('unit'), unitDeps);
  markDep(config.test.includes('e2e'), e2eDeps);

  // CSS
  const windicssDeps = ['windicss', 'vite-plugin-windicss'];
  const lessDeps = ['less'];
  const sassDeps = ['sass'];
  markDep(config.css.includes('windicss'), windicssDeps);
  markDep(config.css.includes('less'), lessDeps);
  markDep(config.css.includes('sass'), sassDeps);

  // devtool
  const devtoolOnlineDeps = ['electron-devtools-installer'];
  markDep(config.devtools.includes('online'), devtoolOnlineDeps);

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

/** Transform string */
export const patchPackageJson = (code: string, config: PromptAnswers) => {
  const result = patchDevDependencies(code, config);
  console.log(result);
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
