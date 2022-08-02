import { spawn } from 'child_process';
import type { Logger } from '../types';

export const gitCloneTo = async (repo: string, dest: string, logger?: Logger) => {
  return new Promise<void>((resolve, reject) => {
    const process = spawn('git', ['clone', `${repo}`, `${dest}`, '--progress'], {
      stdio: 'inherit',
    });

    if (logger) {
      process.stdout?.on('data', logger.log);
      process.stderr?.on('data', logger.error);
    }

    process.on('close', (error: number) => {
      if (error) {
        if (logger) {
          logger.error('Git clone error.');
          logger.abort('GIT_CLONE_ABORT');
        }
        reject();
      } else {
        resolve();
      }
    });
  });
};
