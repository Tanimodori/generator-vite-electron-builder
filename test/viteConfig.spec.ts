import fs from 'fs';
import path from 'path';
import { modifyString } from 'src/app/execuator/stringModification';
import { parseCode, insertImports, insertVitePlugins } from 'src/app/execuator/viteConfig';
import { describe, expect, it } from 'vitest';
import { REPO_DIR, TEST_NAME_ORIGINAL } from './setup';

const src = path.resolve(REPO_DIR, TEST_NAME_ORIGINAL);
const viteConfigPath = 'packages/renderer/vite.config.js';
const srcViteConfigPath = path.resolve(src, viteConfigPath);

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

describe('vite.config.js Test', () => {
  it('can insert import', () => {
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
    const estree = parseCode(exampleCode);
    const builder = modifyString(exampleCode);
    insertImports(estree, builder, "import {bar} from 'foo';\n");
    expect(builder.apply()).toBe(expectedCode);
  });

  it('can insert plugin', () => {
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
    const estree = parseCode(exampleCode);
    const builder = modifyString(exampleCode);
    insertVitePlugins(estree, builder, '\n    foo(),');
    expect(builder.apply()).toBe(expectedCode);
  });

  it('can transform actual config', async () => {
    const buffer = await fs.promises.readFile(srcViteConfigPath);
    expect(buffer.length).toBeGreaterThan(0);
    const srcViteConfig = buffer.toString();
    expect(srcViteConfig.length).toBeGreaterThan(0);

    const estree = parseCode(srcViteConfig);
    expect(estree).toBeTruthy();
  });
});
