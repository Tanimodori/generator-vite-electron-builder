import Generator from 'yeoman-generator';
import { getPrompts } from './prompts';

export default class extends Generator {
  public constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);
  }

  async initializing() {
    this.log('Welcome to use vite-electron-builder');
  }

  async prompting() {
    const answers = await this.prompt(getPrompts(this));

    this.log(answers);
  }
}
