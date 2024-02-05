import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';
import {XLFRenderState} from 'src/xlf/renderer/md-xlf/state';

export const text: Renderer.RenderRuleRecord = {
    text: function(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
        const text = tokens[i];

        if (text.content === '[{#T}]') {
            console.log(text);
            process.exit(0);
        }

        if (!text.content?.length || text.reflink) {
            return '';
        }

        return text.content;
    },
};
