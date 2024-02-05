import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import {XLFRenderState} from 'src/xlf/renderer/md-xlf/state';

export const text: Renderer.RenderRuleRecord = {
    text: function(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
        const text = tokens[i];

        if (!text.content?.length || text.reflink) {
            return '';
        }

        return text.content;
    },
};
