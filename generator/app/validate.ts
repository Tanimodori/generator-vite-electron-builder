import fs from 'fs';
import validateNPMPackageName from 'validate-npm-package-name';

export const validateProjectName = async (name: string): Promise<true | string> => {
  if (!name) {
    return 'Project name must not be empty';
  }
  if (!validateNPMPackageName(name).validForNewPackages) {
    return 'Project name is not a valid npm package name';
  }
  return true;
};

export const pathExist = async (path: string) => {
  return fs.promises
    .access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
};
