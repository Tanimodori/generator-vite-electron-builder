import Generator from 'yeoman-generator';
import { getPrompts } from './prompts';
import { hasGit } from './validate/toolchain';

export default class extends Generator {
  public constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);
  }

  async initializing() {
    this.log('Welcome to use vite-electron-builder');
    this.log();
    // Checking prerequisites
    if (!(await hasGit())) {
      this.log.error('Git not detected, but we need Git to pull the repository.');
      this.log.error('More info on https://git-scm.com/book/en/v2/Getting-Started-Installing-Git');
      this.env.error(new Error('ERR_GIT_NOT_DETECTED'));
    }
  }

  async prompting() {
    const answers = await this.prompt(getPrompts(this));

    this.log(answers);
  }
}
