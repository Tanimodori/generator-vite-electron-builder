import Generator from 'yeoman-generator';
import { validateProjectName } from './validate/name';

export interface PromptAnswers {
  id: string;
  eslint: boolean;
  prettier: boolean;
  prettierStyle: 'original' | 'community' | 'noop';
  test: ('unit' | 'e2e')[];
  css: ('tailwindcss' | 'less' | 'saas')[];
  devtools: 'online' | 'local' | 'noop';
}

export const prompt = async (generator: Generator) => {
  const prompts = [
    {
      type: 'input',
      name: 'id',
      message: 'Project Name?',
      transformer: (id: string) => id.trim(),
      validate: async (input: string) => {
        return validateProjectName(generator, input);
      },
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
    {
      type: 'list',
      name: 'devtools',
      message: 'Install Vue Devtools via?',
      default: 'online',
      choices: [
        {
          name: 'electron-devtools-installer, a online installer',
          short: 'electron-devtools-installer',
          value: 'online',
        },
        {
          name: "The local installed devtools in Chrome's Appdata",
          short: 'Local',
          value: 'local',
        },
        {
          name: 'Do not install',
          short: 'Empty',
          value: 'noop',
        },
      ],
    },
  ];
  return generator.prompt<PromptAnswers>(prompts);
};
