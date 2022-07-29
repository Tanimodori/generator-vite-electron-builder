import Generator from 'yeoman-generator';

export default class extends Generator {
  constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);

    console.log('hello world');
  }
}
