import fs from 'fs';
import path from 'path';
import { parseCode } from 'src/app/execuator/viteConfig';
import { describe, expect, it } from 'vitest';
import { REPO_DIR, TEST_NAME_ORIGINAL } from './setup';

const src = path.resolve(REPO_DIR, TEST_NAME_ORIGINAL);
const viteConfigPath = 'packages/renderer/vite.config.js';
const srcViteConfigPath = path.resolve(src, viteConfigPath);

describe('vite.config.js Test', () => {
  it('should be functional', async () => {
    const buffer = await fs.promises.readFile(srcViteConfigPath);
    expect(buffer.length).toBeGreaterThan(0);
    const srcViteConfig = buffer.toString();
    expect(srcViteConfig.length).toBeGreaterThan(0);

    const estree = parseCode(srcViteConfig);
    console.log(estree);
    expect(estree).toBeTruthy();
  });
});
