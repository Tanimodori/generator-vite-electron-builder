import Generator from 'yeoman-generator';

export default class extends Generator {
  public constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);
  }

  async prompting() {
    this.log('Welcome to use vite-electron-builder');

    const answers = await this.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Project Name?',
        default: 'vite-electron-builder',
      },
      {
        type: 'confirm',
        name: 'eslint',
        message: 'Use ESlint?',
      },
      {
        type: 'confirm',
        name: 'prettier',
        message: 'Use Prettier?',
      },
      {
        type: 'list',
        name: 'prettierStyle',
        message: 'Preferred prettier style?',
        default: 'original',
        choices: [
          {
            name: 'The original style used in vite-electron-builder',
            short: 'Original',
            value: 'original',
          },
          {
            name: 'The Popular style used in Vue community',
            short: 'Community',
            value: 'community',
          },
          {
            name: 'Let me decide later',
            short: 'Empty',
            value: 'noop',
          },
        ],
      },
      {
        type: 'confirm',
        name: 'test',
        message: 'Use vitest for testing?',
      },
      {
        type: 'confirm',
        name: 'e2e',
        message: 'Use Playwright for e2e testing?',
      },
      {
        type: 'checkbox',
        name: 'css',
        message: 'Extra CSS features?',
        choices: [
          {
            name: 'TailwindCSS',
            value: 'tailwindcss',
          },
          {
            name: 'Less',
            value: 'less',
          },
          {
            name: 'Sass/SCSS',
            value: 'saas',
          },
        ],
      },
    ]);

    this.log(answers);
  }
}
