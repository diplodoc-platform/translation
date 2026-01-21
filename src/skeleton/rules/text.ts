import type Renderer from 'markdown-it/lib/renderer';

import {Liquid} from '../liquid';

export const text: Renderer.RenderRuleRecord = {
    text_special: (tokens: Token[], i: number) => {
        tokens[i].type = 'text';
        tokens[i].content = tokens[i].markup;

        return '';
    },
    text: function (tokens: Token[], i: number) {
        const token = tokens[i];

        if (token.reflink) {
            return '';
        }

        if (token?.generated !== 'liquid' && token.content) {
            const newTokens = new Liquid(token.content)
                .tokenize()
                .map((t) => ({...t, isInlineCode: token.isInlineCode}) as Token);
            tokens.splice(i, 1, ...newTokens);
        }

        return '';
    },
};
