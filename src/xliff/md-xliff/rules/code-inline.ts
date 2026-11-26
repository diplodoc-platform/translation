import type {Renderer, Token} from 'markdown-it';

import {generateX} from 'src/xliff/generator';

export const codeInline: Renderer['rules'] = {
    code_inline_open: codeInlineRule('open'),
    code_inline_close: codeInlineRule('close'),
};

function codeInlineRule(dir: string) {
    return function (tokens: Token[], i: number) {
        const {markup} = tokens[i];

        return generateX({
            ctype: `code_${dir}`,
            equivText: markup,
        });
    };
}
