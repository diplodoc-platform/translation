import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/state';
import {gt, lt, qt, sl} from 'src/xlf/symbols';

const rules: Renderer.RenderRuleRecord = {
    code_inline: codeInline,
};

function codeInline(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const {markup = '`', content} = tokens[i];

    return `${lt}g ctype=${qt}x-${markup}-${markup}${qt}${gt}${content}${lt}${sl}g${gt}`;
}

export {rules};
export default {rules};
