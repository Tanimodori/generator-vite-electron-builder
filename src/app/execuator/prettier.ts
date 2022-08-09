import path from 'path';
import fs from 'fs';
import { PromptAnswers } from '../prompts';
import { transformFile } from './fs';

export const prettierNoopStyle = `{}`;

export const prettierCommunityStyle = `
{
  "printWidth": 100,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "proseWrap": "never",
  "htmlWhitespaceSensitivity": "strict",
  "vueIndentScriptAndStyle": true,
  "endOfLine": "auto"
}
`;

export const prettierrcPath = `.prettierrc`;
export const prettierIgnorePath = `.prettierignore`;

/** Transform file */
export const patchPrettierFrom = async (dest: string, config: PromptAnswers) => {
  const finalPrettierrcPath = path.resolve(dest, prettierrcPath);
  const finalPrettierIgnorePath = path.resolve(dest, prettierIgnorePath);
  if (!config.prettier) {
    // no prettier
    await fs.promises.rm(finalPrettierrcPath);
    await fs.promises.rm(finalPrettierIgnorePath);
  } else {
    if (config.prettierStyle === 'community') {
      await transformFile(finalPrettierrcPath, () => prettierCommunityStyle);
    } else if (config.prettierStyle === 'noop') {
      await transformFile(finalPrettierrcPath, () => prettierNoopStyle);
    }
  }
};
