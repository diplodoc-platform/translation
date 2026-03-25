import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';

import {Consumer} from 'src/consumer';
import {Liquid} from 'src/skeleton/liquid';

export const image: Renderer.RenderRuleRecord = {
    image_open: function (tokens: Token[], idx) {
        const open = tokens[idx];

        const skip = (open.skip = (open.skip || []) as string[]);
        skip.push('![');

        return '';
    },
    image_close: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const close = tokens[idx];
        const titleAttr = Liquid.unescape(close.attrGet('title') || '');

        const skip = (close.skip = (close.skip || []) as string[]);
        skip.push(')');

        if (close.titleAttrsValue) {
            // Title set via attrs syntax: ![alt](src){title="..."}
            // beforeDrop goes on suffixToken (always in `after`) so it fires in both
            // compact and non-compact modes. close itself may end up in `content`
            // in non-compact mode where beforeDrop would never fire.
            const attrsTitle = Liquid.unescape(close.titleAttrsValue);
            const consumer = new Consumer(attrsTitle, this.state, this.state.hash);
            const tokenizer = new Liquid(attrsTitle);
            const titleTokens = tokenizer.tokenize();
            const parts = consumer.process(titleTokens);

            if (close.titleSuffixToken) {
                close.titleSuffixToken.beforeDrop = (consumer: Consumer) => {
                    parts.forEach(({part, past}) => consumer.consume(part, past));
                };
            }

            skip.unshift('(');
        } else if (titleAttr) {
            // Title set via standard markdown syntax: ![alt](src "title")
            const consumer = new Consumer(titleAttr, this.state, this.state.hash);
            const tokenizer = new Liquid(titleAttr);
            const titleTokens = tokenizer.tokenize();
            const parts = consumer.process(titleTokens);

            close.attrSet('title', consumer.content);
            close.beforeDrop = (consumer: Consumer) => {
                parts.forEach(({part, past}) => consumer.consume(part, past));
            };
        } else {
            skip.unshift('(');
        }

        close.attrSet('src', Liquid.unescape(close.attrGet('src') || ''));

        return '';
    },
};
