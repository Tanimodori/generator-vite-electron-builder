import fs from 'fs';
import path from 'path';
import { REPO_DIR, TEST_NAME_ORIGINAL } from './setup';

/** Load original repo file for unit testing */
export const loadOriginalRepoFile = async (filePath: string): Promise<string> => {
  const packageJsonPath = path.resolve(REPO_DIR, TEST_NAME_ORIGINAL, filePath);
  const buffer = await fs.promises.readFile(packageJsonPath);
  return buffer.toString();
};
