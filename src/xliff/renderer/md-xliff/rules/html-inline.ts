import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRenderState} from 'src/xliff/renderer/md-xliff/state';
import {generateX} from 'src/xliff/generator';

export const htmlInline: Renderer.RenderRuleRecord = {
    html_inline: function (this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
        const {content, type} = tokens[i];

        return generateX({ctype: type, equivText: content});
    },
};
