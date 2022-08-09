import path from 'path';
import fs from 'fs';
import { PromptAnswers } from '../prompts';

export const unitTestPath = [
  `packages/renderer/tests`,
  `packages/preload/tests`,
  `packages/main/tests`,
];
export const e2eTestPath = `tests`;

/** Transform file */
export const patchPrettierFrom = async (dest: string, config: PromptAnswers) => {
  if (!config.test.includes('unit')) {
    // no unit files
    for (const unitTestPathItem of unitTestPath) {
      await fs.promises.rm(path.resolve(dest, unitTestPathItem));
    }
  }
  if (!config.test.includes('e2e')) {
    // no e2e files
    await fs.promises.rm(path.resolve(dest, e2eTestPath));
  }
};
