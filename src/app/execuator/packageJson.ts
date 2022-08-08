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

/** patch 'devDependencies' */
export const patchDevDependencies = (code: string, config: PromptAnswers) => {
  const original = parseJsonc(code);
  const devMods = buildDevMods(config);
  console.log(devMods);
};

/** Transform string */
export const patchPackageJson = (code: string, config: PromptAnswers) => {
  patchDevDependencies(code, config);
  return code;
};

/** Transform file */
export const patchPackageJsonFrom = async (path: string, config: PromptAnswers) => {
  await transformFile(path, (src) => patchPackageJson(src, config));
};
