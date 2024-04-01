import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';
import {Tokenizer} from '../liquid';
import {token} from 'src/utils';
import MarkdownIt from 'markdown-it';

type MarkdownItWithMeta = MarkdownIt & {
  meta: {};
};

export function meta(this: CustomRenderer<Consumer, MarkdownItWithMeta>) {
  const meta = this.md.meta ?? {};

  if (!Object.keys(meta).length) {
    return '';
  }

  traverse(meta, (value, key) => {
    const tokenizer = new Tokenizer(value);
    this.state.process(token('fake', {skip: key}));
    this.state.process([...tokenizer.tokenize()]);
  });

  return '';
}

type Meta =
  | string
  | {
      [prop: string | number]: Meta;
    };

function traverse(
  meta: Meta,
  fn: (val: string, key: string | null | undefined) => void,
  key?: string | null,
) {
  if (typeof meta === 'string') {
    fn(meta, key);
  } else if (Array.isArray(meta)) {
    for (const val of meta) {
      traverse(val, fn);
    }
  } else if (meta && typeof meta === 'object') {
    for (const [key, val] of Object.entries(meta)) {
      traverse(val, fn, key);
    }
  }
}
