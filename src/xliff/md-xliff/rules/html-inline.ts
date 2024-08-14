import type Renderer from 'markdown-it/lib/renderer';

import {generateX} from 'src/xliff/generator';

export const htmlInline: Renderer.RenderRuleRecord = {
    html_inline: function (tokens: Token[], i: number) {
        const {skip, type} = tokens[i];

        return generateX({ctype: type, equivText: (skip || '').toString()});
    },
};
