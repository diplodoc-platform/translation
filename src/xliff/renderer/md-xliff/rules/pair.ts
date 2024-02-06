import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRenderState} from 'src/xliff/renderer/md-xliff/state';
import {generateX} from 'src/xliff/generator';

export const pair: Renderer.RenderRuleRecord = {
    strong_open: pairOpen,
    strong_close: pairOpen,
    em_open: pairOpen,
    em_close: pairOpen,
    s_open: pairOpen,
    s_close: pairOpen,
    sup_open: pairOpen,
    sup_close: pairOpen,
    monospace_open: pairOpen,
    monospace_close: pairOpen,
};

function pairOpen(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
    const {markup, tag, type} = tokens[i];
    if (!markup?.length) {
        throw new Error(`markup missing for token: ${type}`);
    }
    if (!tag?.length) {
        throw new Error(`tag missing for token: ${type}`);
    }

    const [_, tagType] = type.split('_');

    return generateX({
        ctype: `${tag}_${tagType}`,
        equivText: markup,
    });
}
