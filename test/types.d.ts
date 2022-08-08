import { beforeEach } from 'vitest';
type BeforeEachFunction<T = unknown> = Parameters<typeof beforeEach>[0] extends (
  context: infer C,
  ...args: infer P
) => infer R
  ? (context: C & T, ...args: P) => R
  : never;
