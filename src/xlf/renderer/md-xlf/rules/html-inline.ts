import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateX} from 'src/xlf/generator';

const htmlInline: Renderer.RenderRuleRecord = {
    html_inline: htmlInlineRule,
};

function htmlInlineRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const {content, type} = tokens[i];

    return generateX({ctype: type, equivText: content});
}

export {htmlInline};
export default {htmlInline};
