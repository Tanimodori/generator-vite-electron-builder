import Generator from 'yeoman-generator';
import { gitCloneTo } from './execuator/git';
import { patchPackageJsonFrom } from './execuator/packageJson';
import { patchPrettierFrom } from './execuator/prettier';
import { patchTestFileFrom } from './execuator/test';
import { patchViteConfigFrom } from './execuator/viteConfig';
import { getPrompts, type PromptAnswers } from './prompts';
import { Logger } from './types/types';
import { hasGit } from './validate/toolchain';
import EslintConfigGenerator from '../eslint';
import path from 'path';

export const REPO_URL = 'https://github.com/cawa-93/vite-electron-builder.git';

export default class extends Generator {
  answers?: PromptAnswers;
  public constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);
  }

  get logger(): Logger {
    return {
      log: (message?: string) => this.log(message),
      error: (message?: string) => this.log.error(message),
      abort: (message?: string) => this.env.error(new Error(message)),
    };
  }

  async initializing() {
    this.composeWith(
      { Generator: EslintConfigGenerator, path: path.resolve(__dirname, '../eslint') },
      this.answers,
    );

    this.log('Welcome to use vite-electron-builder');
    this.log();
    // Checking prerequisites
    if (!(await hasGit())) {
      this.log.error('Git not detected, but we need Git to clone the repository.');
      this.log.error('More info on https://git-scm.com/book/en/v2/Getting-Started-Installing-Git');
      this.env.error(new Error('GIT_NOT_DETECTED'));
    }
  }

  async prompting() {
    this.answers = await this.prompt(getPrompts(this.destinationPath()));

    this.log(this.answers);
  }

  async configuring() {
    if (!this.answers) {
      this.env.error(new Error('ILLEGAL_ARG'));
      return;
    }
    // Set destination path to sub directory
    this.destinationRoot(this.destinationPath(this.answers.id));
    // Clone git repository
    await gitCloneTo(REPO_URL, this.destinationPath(), this.logger);

    // Mount hooks
    this.composeWith(
      { Generator: EslintConfigGenerator, path: path.resolve(__dirname, '../eslint') },
      this.answers,
    );
    const depAddition = await patchPackageJsonFrom(this.destinationPath(), this.answers);
    await patchViteConfigFrom(this.destinationPath(), this.answers);
    await patchPrettierFrom(this.destinationPath(), this.answers);
    await patchTestFileFrom(this.destinationPath(), this.answers);

    await this.addDevDependencies(depAddition);
  }
}
