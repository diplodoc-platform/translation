import type {CustomRendererHookParams} from '@diplodoc/markdown-it-custom-renderer';
import {token} from 'src/utils';
import { Consumer } from 'src/skeleton/consumer';

export function beforeInline(parameters: CustomRendererHookParams) {
    const tokens = parameters.tokens as Token[];
    for (let idx = 0; idx < tokens.length; idx++) {
        if (tokens[idx].type === 'code_inline') {
            splitInlineCode.call(this, tokens, idx);
        }
    }

    return '';
}

export function splitInlineCode(tokens: Token[], idx: number) {
    const codeInlineOpen = token('code_inline_open', {
        content: '',
        markup: tokens[idx].markup,
        skip: [tokens[idx].markup],
        // onskip: (content, from, to) => {
        //     if (content[to] === ' ') {
        //         codeInlineOpen.markup += ' ';
        //     }
        // }
    });

    const text = token('text', {
        // stupid special case
        content: ['`', '``', '```'].includes(tokens[idx].content)
            ? ' ' + tokens[idx].content + ' '
            : tokens[idx].content,
    });
    const codeInlineClose = token('code_inline_close', {
        content: '',
        markup: tokens[idx].markup,
        skip: [tokens[idx].markup],
        // onskip: (content, from, to) => {
        //     if (content[to - codeInlineClose.markup.length - 1] === ' ') {
        //         codeInlineClose.markup = ' ' + codeInlineClose.markup;
        //     }
        // }
    });

    tokens.splice(idx, 1, codeInlineOpen, text, codeInlineClose);
}
