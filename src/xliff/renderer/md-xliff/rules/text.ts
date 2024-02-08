import type {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import type {XLFRenderState} from 'src/xliff/renderer/md-xliff';
import type Renderer from 'markdown-it/lib/renderer';

export const text: Renderer.RenderRuleRecord = {
    text: function(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
        const text = tokens[i];

        if (!text.content?.length || text.reflink) {
            return '';
        }

        return text.content;
    },
};
