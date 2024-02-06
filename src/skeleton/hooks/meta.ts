import MarkdownIt from 'markdown-it';
import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import {Consumer} from 'src/skeleton/consumer';
import {Tokenizer} from 'src/liquid';

export type MetaParams = {
    markdownit: MarkdownItWithMeta;
};

export type MarkdownItWithMeta = MarkdownIt & {
    meta: {};
};

export function hook(parameters: MetaParams) {
    return function (this: CustomRenderer) {
        const meta = parameters.markdownit.meta ?? {};
        const consumer = new Consumer(this.state.result, this.state.cursor, this.state);

        if (!Object.keys(meta).length) {
            return '';
        }

        traverse(meta, (value, key) => {
            const tokenizer = new Tokenizer(value);
            consumer.skip(key);
            consumer.process([...tokenizer.tokenize()]);
        });

        this.state.result = consumer.content;
        this.state.cursor = consumer.cursor;
        this.state.gap += consumer.gap;

        return '';
    };
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
