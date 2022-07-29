import Generator from 'yeoman-generator';

export default class extends Generator {
  public constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);

    this.greet();
  }

  greet() {
    console.log('hello world');
  }
}
