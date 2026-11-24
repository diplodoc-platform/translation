import type Renderer from 'markdown-it/lib/renderer';

import {generateX} from 'src/xliff/generator';

export function renderLiquid({subtype, markup, content}: Token) {
    return generateX({ctype: `liquid_${subtype}`, equivText: markup || content});
}

export const liquid: Renderer.RenderRuleRecord = {
    liquid: function (tokens: Token[], i: number) {
        return renderLiquid(tokens[i]);
    },
};
