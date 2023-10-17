import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateX} from 'src/xlf/generator';

const codeInline: Renderer.RenderRuleRecord = {
    code_inline: codeInlineRule,
};

function codeInlineRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const {markup, content, tag} = tokens[i];

    return generateX({ctype: tag, equivText: `${markup}${content}${markup}`});
}

export {codeInline};
export default {codeInline};
