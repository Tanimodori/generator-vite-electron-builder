import { describe, expect, it } from 'vitest';
import { modifyString } from '../src/app/execuator/stringModification';

describe('ModifyString Test', () => {
  it('should be functional', () => {
    const source = '0123456789ABCDEF';
    const mod = modifyString(source).insert(0, '^^').remove(1, 2).replace(10, 16, 'foo');
    expect(mod.apply()).toBe('^^023456789foo');
  });

  it('should report overlaps', () => {
    const source = '0123456789ABCDEF';
    const mod = modifyString(source).insert(0, '^^').remove(4, 6).replace(5, 7, 'N');
    expect(() => mod.apply()).toThrowError('Mods overlaps');
  });
});
