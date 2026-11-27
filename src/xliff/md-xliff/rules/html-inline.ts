import type {Renderer} from 'markdown-it';

import {generateX} from 'src/xliff/generator';

export const htmlInline: Renderer['rules'] = {
    html_inline: function (tokens: Token[], i: number) {
        const {skip, type} = tokens[i];

        return generateX({ctype: type, equivText: (skip || '').toString()});
    },
};
