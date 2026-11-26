import type {Renderer} from 'markdown-it';

import {generateX} from 'src/xliff/generator';

export const noTranslate: Renderer['rules'] = {
    no_translate_inline: noTranslateInline,
};

function noTranslateInline(tokens: Token[], i: number) {
    const token = tokens[i];
    const type = token.type;
    const skip = token.skip;

    return generateX({ctype: type, equivText: (skip || '').toString()});
}
