import fs from 'fs';
import path from 'path';
import { modifyString } from 'src/app/execuator/stringModification';
import { parseCode } from 'src/app/execuator/typescript';
import {
  patchRendererConfig,
  insertImports,
  insertVitePlugins,
} from 'src/app/execuator/viteConfig';
import { PromptAnswers } from 'src/app/prompts';
import type { StringBuilder } from 'src/app/execuator/stringModification';
import type { TSESTree } from '@typescript-eslint/types';
import { beforeEach, describe, expect, it, TestFunction } from 'vitest';
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

type BeforeEachFunction<T = unknown> = Parameters<typeof beforeEach>[0] extends (
  context: infer C,
  ...args: infer P
) => infer R
  ? (context: C & T, ...args: P) => R
  : never;

describe('vite.config.js Unit Test (Simple)', () => {
  interface LocalTestContext {
    estree: TSESTree.Program;
    builder: StringBuilder;
  }

  beforeEach(((context) => {
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
    context.estree = parseCode(exampleCode);
    context.builder = modifyString(exampleCode);
  }) as BeforeEachFunction<LocalTestContext> as BeforeEachFunction);

  it('can insert import', ((context) => {
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
  }) as TestFunction<LocalTestContext> as TestFunction);

  it('can insert plugin', ((context) => {
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
  }) as TestFunction<LocalTestContext> as TestFunction);
});

describe('vite.config.js Unit Test (Actual)', () => {
  interface LocalTestContext {
    source: string;
  }

  beforeEach((async (context) => {
    // construct viteConfigPath
    const src = path.resolve(REPO_DIR, TEST_NAME_ORIGINAL);
    const viteConfigPath = 'packages/renderer/vite.config.js';
    const srcViteConfigPath = path.resolve(src, viteConfigPath);

    // read file content
    const buffer = await fs.promises.readFile(srcViteConfigPath);
    const srcViteConfig = buffer.toString();

    // prepare testing context
    context.source = srcViteConfig;
  }) as BeforeEachFunction<LocalTestContext> as BeforeEachFunction);
  it('can transform actual config', (async (context) => {
    const patchedViteConfig = patchRendererConfig(context.source, configWithWindiCSS);
    expect(patchedViteConfig).toBeTruthy();
    console.log(patchedViteConfig);
  }) as TestFunction<LocalTestContext> as TestFunction);
});
