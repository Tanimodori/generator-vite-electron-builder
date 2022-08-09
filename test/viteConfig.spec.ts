import { modifyString } from 'src/app/execuator/stringModification';
import { parseCode } from 'src/app/execuator/typescript';
import {
  patchRendererConfig,
  insertImports,
  insertVitePlugins,
  rendererConfigPath,
} from 'src/app/execuator/viteConfig';
import { PromptAnswers } from 'src/app/prompts';
import type { StringBuilder } from 'src/app/execuator/stringModification';
import type { TSESTree } from '@typescript-eslint/types';
import { beforeAll, beforeEach, describe, expect, it, TestFunction } from 'vitest';
import { BeforeEachFunction } from './types';
import { loadOriginalRepoFile } from './utils';

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

  let source = '';

  beforeAll(async () => {
    source = await loadOriginalRepoFile(rendererConfigPath);
  });

  beforeEach((async (context) => {
    context.source = source;
  }) as BeforeEachFunction<LocalTestContext> as BeforeEachFunction);

  it('can transform actual config with windicss', (async (context) => {
    const patchedViteConfig = patchRendererConfig(context.source, configWithWindiCSS);
    expect(patchedViteConfig).toContain('WindiCSS');
  }) as TestFunction<LocalTestContext> as TestFunction);
  it('can transform actual config with noop', (async (context) => {
    const patchedViteConfig = patchRendererConfig(context.source, configWithoutWindiCSS);
    expect(patchedViteConfig).not.toContain('WindiCSS');
  }) as TestFunction<LocalTestContext> as TestFunction);
});
