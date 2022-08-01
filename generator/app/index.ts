import Generator from 'yeoman-generator';
import { gitCloneTo } from './execuator/git';
import { prompt, PromptAnswers } from './prompts';
import { hasGit } from './validate/toolchain';

const REPO_URL = 'https://github.com/cawa-93/vite-electron-builder.git';

export default class extends Generator {
  answers?: PromptAnswers;
  public constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);
  }

  async initializing() {
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
    this.answers = await prompt(this);

    this.log(this.answers);
  }

  async configuring() {
    if (!this.answers) {
      this.env.error(new Error('ILLEGAL_ARG'));
      return;
    }
    // Clone git repository
    await gitCloneTo(this, REPO_URL, this.answers.id);
  }
}
