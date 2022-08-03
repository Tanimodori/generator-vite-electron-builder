import path from 'path';
import { REPO_URL } from 'src/app';
import { gitCloneTo } from 'src/app/execuator/git';
import { pathExist } from 'src/app/validate/name';

export const TEST_NAME = 'test-repo';
export const TEST_NAME_ORIGINAL = `${TEST_NAME}-original`;

const dest = path.resolve('test/repo', TEST_NAME_ORIGINAL);

if (!(await pathExist(dest))) {
  await gitCloneTo(REPO_URL, dest, {
    log: console.log,
    error: console.error,
    abort: (message?: string) => {
      console.error(message);
      process.exit(-1);
    },
  });
}
