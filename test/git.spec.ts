import { describe, expect, it } from 'vitest';

import { hasGit } from '../src/app/validate/toolchain';

describe('Git Test', () => {
  it('check git installation', () => {
    expect(hasGit()).resolves.toBe(true);
  });
});
