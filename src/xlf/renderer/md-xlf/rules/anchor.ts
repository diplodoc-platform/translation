import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';

import {generateX} from 'src/xlf/generator';

const anchor: Renderer.RenderRuleRecord = {
    anchor: anchorRule,
};

function anchorRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const token = tokens[i];

    return generateX({ctype: 'anchor', equivText: ` {${token.content}}`});
}

export {anchor};
export default {anchor};
