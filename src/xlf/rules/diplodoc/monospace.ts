import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/state';
import {gt, lt, qt, sl} from 'src/xlf/symbols';

const rules: Renderer.RenderRuleRecord = {
    monospace_open: monospaceOpen,
    monospace_close: monospaceClose,
};

function monospaceOpen(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    let {markup} = tokens[i];
    if (!markup?.length) {
        markup = '##';
    }

    return `${lt}g ctype=${qt}x-${markup}-${markup}${qt}${gt}`;
}

function monospaceClose(this: CustomRenderer<XLFRendererState>) {
    return `${lt}${sl}g${gt}`;
}

export {rules};
export default {rules};
