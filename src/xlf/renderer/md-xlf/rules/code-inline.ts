import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateOpenG, generateCloseG} from 'src/xlf/generator';

const codeInline: Renderer.RenderRuleRecord = {
    code_inline: codeInlineRule,
};

function codeInlineRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const {markup, content, tag, type} = tokens[i];
    if (!markup?.length) {
        throw new Error(`markup missing for token: ${type}`);
    }

    let rendered = '';

    rendered += generateOpenG({ctype: tag, equivText: markup});
    rendered += content;
    rendered += generateCloseG();

    return rendered;
}

export {codeInline};
export default {codeInline};
