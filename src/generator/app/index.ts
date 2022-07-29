import Generator from 'yeoman-generator';
import foo from './foo';

export default class extends Generator {
  public constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);

    this.greet();
  }

  greet() {
    foo();
  }
}
