import type {CustomRendererHookParams} from '@diplodoc/markdown-it-custom-renderer';
import {token} from 'src/utils';

export function beforeInline(parameters: CustomRendererHookParams) {
    if (!parameters.rendered) {
        return '';
    }

    const tokens = parameters.tokens;
    for (let idx = 0; idx < tokens.length; idx++) {
        if (tokens[idx].type === 'code_inline') {
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
    }

    return '';
}
