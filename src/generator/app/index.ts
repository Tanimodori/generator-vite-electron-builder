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
        when: (currentAnswers: { prettier: boolean }) => currentAnswers.prettier,
        default: 'original',
        choices: [
          {
            name: 'The original style used in vite-electron-builder',
            short: 'Original',
            value: 'original',
          },
          {
            name: 'The popular style used in Vue community',
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
        type: 'checkbox',
        name: 'test',
        message: 'Test features?',
        default: ['unit', 'e2e'],
        choices: [
          {
            name: 'Unit tests',
            value: 'unit',
          },
          {
            name: 'e2e tests',
            value: 'e2e',
          },
        ],
      },
      {
        type: 'checkbox',
        name: 'css',
        message: 'CSS features?',
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
