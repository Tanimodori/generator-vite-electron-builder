import Generator from 'yeoman-generator';
import { findNodeAtLocation } from 'jsonc-parser';
import { PromptAnswers } from '../app/prompts';
import { editJsonc, parseJsonc } from '../app/execuator/jsonc';

export const eslintrcPath = {
  index: '.eslintrc.json',
  renderer: 'packages/renderer/.eslintrc.json',
};

export const eslintPrettierExtends = ['plugin:prettier/recommended'];

/** Append eslint extends */
export const insertExtends = (code: string, items: string[]) => {
  const node = parseJsonc(code);
  if (!node) {
    throw new Error('Error parsing eslint config while inserting eslint extends');
  }
  const originalExtends = findNodeAtLocation(node, ['extends']);
  if (!originalExtends || originalExtends.type !== 'array' || !originalExtends.children) {
    throw new Error('Error parsing eslint config while inserting eslint extends');
  }
  let originalExtendsCount = originalExtends.children.length;
  let result = code;
  for (const item of items) {
    result = editJsonc(result, ['extends', ++originalExtendsCount], item, {
      isArrayInsertion: true,
    });
  }
  return result;
};

/** Transform string */
export const patchEslintrc = (code: string, config: PromptAnswers) => {
  if (config.eslint && config.prettier) {
    return insertExtends(code, eslintPrettierExtends);
  } else {
    return code;
  }
};

export default class EslintConfigGenerator extends Generator {
  options: PromptAnswers;
  constructor(args: string | string[], opts: Generator.GeneratorOptions) {
    super(args, opts);

    this.options = opts as PromptAnswers;
  }

  async writing() {
    for (const eslintrcPathItem in Object.values(eslintrcPath)) {
      if (!this.options.eslint) {
        // no eslint
        this.fs.delete(eslintrcPathItem);
      } else {
        let content = this.fs.read(eslintrcPathItem);
        content = patchEslintrc(content, this.options);
        this.fs.write(eslintrcPathItem, content);
      }
    }
  }
}
