import type {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';
import {token} from 'src/utils';

export function beforeInline(parameters: CustomRendererHookParameters) {
    const tokens = parameters.tokens as Token[];
    for (let idx = 0; idx < tokens.length; idx++) {
        if (tokens[idx].type === 'code_inline') {
            splitInlineCode(tokens, idx);
        }
    }

    return '';
}

export function splitInlineCode(tokens: Token[], idx: number) {
    const codeInlineOpen = token('code_inline_open', {
        content: '',
        markup: tokens[idx].markup,
        skip: [tokens[idx].markup],
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
    });

    tokens.splice(idx, 1, codeInlineOpen, text, codeInlineClose);
}
