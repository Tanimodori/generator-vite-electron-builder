import Generator from 'yeoman-generator';
import { gitCloneTo } from './execuator/git';
import { getPrompts, PromptAnswers } from './prompts';
import { hasGit } from './validate/toolchain';

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
    const answers = await this.prompt(getPrompts(this));
    this.answers = answers;

    this.log(this.answers);
  }

  async configuring() {
    if (!this.answers) {
      this.env.error(new Error('ILLEGAL_ARG'));
      return;
    }
    // Clone git repository
    await gitCloneTo(this, 'https://github.com/cawa-93/vite-electron-builder.git', this.answers.id);
  }
}
