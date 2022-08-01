import Generator from 'yeoman-generator';
import { spawn } from 'child_process';

export const gitCloneTo = async (generator: Generator, repo: string, dest: string) => {
  return new Promise<void>((resolve, reject) => {
    const process = spawn('git', ['clone', `${repo}`, `${dest}`, '--progress'], {
      stdio: 'inherit',
    });

    process.stdout?.on('data', generator.log);
    process.stderr?.on('data', generator.log.error);

    process.on('close', (error: number) => {
      if (error) {
        generator.log.error('Git clone error.');
        generator.env.error(new Error('GIT_CLONE_ABORT'));
        reject();
      } else {
        resolve();
      }
    });
  });
};
