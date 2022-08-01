import { exec } from 'child_process';

let _hasGit: boolean | null = null;

export const hasGit = async () => {
  if (_hasGit !== null) {
    return _hasGit;
  }
  return new Promise<boolean>((resolve) => {
    exec('git --version', (error) => {
      _hasGit = !error;
      resolve(_hasGit);
    });
  });
};
