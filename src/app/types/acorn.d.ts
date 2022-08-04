import type { Options } from 'acorn';
import * as ESTree from 'estree';

declare module 'acorn' {
  type DistributiveExtendNode<T> = T extends Record<string, unknown>
    ? ExtendNode<T>
    : T extends Array<infer E>
    ? Array<E> extends T
      ? Array<ExtendNode<E>>
      : T
    : T;
  type WithStartEnd<T> = T extends ESTree.Node | ESTree.Comment
    ? {
        start: number;
        end: number;
      }
    : unknown;
  export type ExtendNode<T> = {
    [K in keyof T]: DistributiveExtendNode<T[K]>;
  } & WithStartEnd<T>;

  export function parse(s: string, o: Options): ExtendNode<ESTree.Program>;

  export type AcornComment = Omit<Comment, 'type'> & {
    type: 'Line' | 'Block';
  };
}
