import type Renderer from 'markdown-it/lib/renderer';
import type Token from 'markdown-it/lib/token';

import {generateX} from 'src/xliff/generator';

export const htmlInline: Renderer.RenderRuleRecord = {
    html_inline: function (tokens: Token[], i: number) {
        const {content, type} = tokens[i];

        return generateX({ctype: type, equivText: content});
    },
};
