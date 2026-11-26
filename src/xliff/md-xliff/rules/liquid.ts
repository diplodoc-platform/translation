import type {Renderer} from 'markdown-it';

import {generateX} from 'src/xliff/generator';

export function renderLiquid({subtype, markup, content}: Token) {
    return generateX({ctype: `liquid_${subtype}`, equivText: markup || content});
}

export const liquid: Renderer['rules'] = {
    liquid: function (tokens: Token[], i: number) {
        return renderLiquid(tokens[i]);
    },
};
