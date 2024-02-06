import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import {XLFRenderState} from 'src/xliff/renderer/md-xliff/state';
import {generateX} from 'src/xliff/generator';

export const liquid: Renderer.RenderRuleRecord = {
    liquid: function(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
        const {subtype, content, markup} = tokens[i];

        return generateX({
            ctype: `liquid_${subtype}`,
            equivText: markup || content,
        });
    },
};

