import type Renderer from 'markdown-it/lib/renderer';

import {generateX} from 'src/xliff/generator';

export const noTranslate: Renderer.RenderRuleRecord = {
    no_translate_inline: noTranslateInline,
};

function noTranslateInline(tokens: Token[], i: number) {
    const token = tokens[i];
    const type = token.type;
    const skip = token.skip;

    return generateX({ctype: type, equivText: (skip || '').toString()});
}
