import type Renderer from 'markdown-it/lib/renderer';
import {generateX} from 'src/xliff/generator';

export const liquid: Renderer.RenderRuleRecord = {
    liquid: function(tokens: Token[], i: number) {
        const {subtype, content, markup} = tokens[i];

        return generateX({
            ctype: `liquid_${subtype}`,
            equivText: markup || content,
        });
    },
};

