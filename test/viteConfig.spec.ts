import { TSESTree } from '@typescript-eslint/types';
import fs from 'fs';
import path from 'path';
import { modifyString, StringBuilder } from 'src/app/execuator/stringModification';
import { parseCode } from 'src/app/execuator/typescript';
import {
  patchRendererConfig,
  insertImports,
  insertVitePlugins,
} from 'src/app/execuator/viteConfig';
import { PromptAnswers } from 'src/app/prompts';
import { beforeEach, describe, expect, it } from 'vitest';
import { REPO_DIR, TEST_NAME_ORIGINAL } from './setup';

const configWithoutWindiCSS: PromptAnswers = {
  id: 'test',
  eslint: false,
  prettier: false,
  prettierStyle: 'noop',
  css: [],
  test: [],
  devtools: 'noop',
};
const configWithWindiCSS: PromptAnswers = {
  ...configWithoutWindiCSS,
  css: [...configWithoutWindiCSS.css, 'windicss'],
};

// vitest test context
declare module 'vitest' {
  export interface TestContext {
    estree: TSESTree.Program;
    builder: StringBuilder;
    source: string;
  }
}

describe('vite.config.js Unit Test (Simple)', () => {
  const exampleCode = `
import {foo} from 'bar';

const config = {
  foo: 0,
  bar: {
    baz: null,
  },
  plugins: [
    vue(),
  ],
};
`;

  beforeEach((context) => {
    context.estree = parseCode(exampleCode);
    context.builder = modifyString(exampleCode);
  });

  it('can insert import', (context) => {
    const expectedCode = `
import {foo} from 'bar';
import {bar} from 'foo';

const config = {
  foo: 0,
  bar: {
    baz: null,
  },
  plugins: [
    vue(),
  ],
};
`;
    insertImports(context.estree, context.builder, "import {bar} from 'foo';\n");
    expect(context.builder.apply()).toBe(expectedCode);
  });

  it('can insert plugin', (context) => {
    const expectedCode = `
import {foo} from 'bar';

const config = {
  foo: 0,
  bar: {
    baz: null,
  },
  plugins: [
    vue(),
    foo(),
  ],
};
`;
    insertVitePlugins(context.estree, context.builder, '\n    foo(),');
    expect(context.builder.apply()).toBe(expectedCode);
  });
});

describe('vite.config.js Unit Test (Actual)', () => {
  beforeEach(async (context) => {
    // construct viteConfigPath
    const src = path.resolve(REPO_DIR, TEST_NAME_ORIGINAL);
    const viteConfigPath = 'packages/renderer/vite.config.js';
    const srcViteConfigPath = path.resolve(src, viteConfigPath);

    // read file content
    const buffer = await fs.promises.readFile(srcViteConfigPath);
    const srcViteConfig = buffer.toString();

    // prepare testing context
    context.source = srcViteConfig;
  });
  it('can transform actual config', async (context) => {
    const patchedViteConfig = patchRendererConfig(context.source, configWithWindiCSS);
    expect(patchedViteConfig).toBeTruthy();
    console.log(patchedViteConfig);
  });
});
