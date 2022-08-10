import { modifyString } from 'src/app/execuator/stringModification';
import { parseCode } from 'src/app/execuator/typescript';
import {
  insertImports,
  insertVitePlugins,
  patchViteConfig,
  viteConfigPath,
} from 'src/app/execuator/viteConfig';
import { PromptAnswers } from 'src/app/prompts';
import type { StringBuilder } from 'src/app/execuator/stringModification';
import type { TSESTree } from '@typescript-eslint/types';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
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
const configWithE2E: PromptAnswers = {
  ...configWithoutWindiCSS,
  test: [...configWithoutWindiCSS.test, 'e2e'],
};

describe('vite.config.js Unit Test (Simple)', () => {
  interface LocalTestContext {
    estree: TSESTree.Program;
    builder: StringBuilder;
  }

  beforeEach<LocalTestContext>((context) => {
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
  });

  it<LocalTestContext>('can insert import', (context) => {
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

  it<LocalTestContext>('can insert plugin', (context) => {
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
  interface LocalTestContext {
    source: string;
  }

  let source = '';

  beforeAll(async () => {
    source = await loadOriginalRepoFile(viteConfigPath.renderer);
  });

  beforeEach<LocalTestContext>(async (context) => {
    context.source = source;
  });

  it<LocalTestContext>('can transform actual config with windicss', async (context) => {
    const patchedViteConfig = patchViteConfig(context.source, configWithWindiCSS, 'renderer');
    expect(patchedViteConfig).toContain('WindiCSS');
  });

  it<LocalTestContext>('can transform actual config with e2e', async (context) => {
    const patchedViteConfig = patchViteConfig(context.source, configWithE2E, 'renderer');
    expect(patchedViteConfig).toContain(`environment: 'node',`);
  });

  it<LocalTestContext>('can transform actual config with noop', async (context) => {
    const patchedViteConfig = patchViteConfig(context.source, configWithoutWindiCSS, 'renderer');
    expect(patchedViteConfig).not.toContain('WindiCSS');
    expect(patchedViteConfig).not.toContain('  test: {');
  });
});
