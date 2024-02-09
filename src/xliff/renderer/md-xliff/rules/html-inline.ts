import type {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import type {XLFRenderState} from 'src/xliff/renderer/md-xliff';
import type Renderer from 'markdown-it/lib/renderer';
import type Token from 'markdown-it/lib/token';

import {generateX} from 'src/xliff/generator';

export const htmlInline: Renderer.RenderRuleRecord = {
    html_inline: function (this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
        const {content, type} = tokens[i];

        return generateX({ctype: type, equivText: content});
    },
};
