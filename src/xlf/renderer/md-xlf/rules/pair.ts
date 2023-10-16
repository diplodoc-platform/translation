import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateOpenG, generateCloseG} from 'src/xlf/generator';

const pair: Renderer.RenderRuleRecord = {
    strong_open: pairOpen,
    strong_close: generateCloseG,
    em_open: pairOpen,
    em_close: generateCloseG,
    s_open: pairOpen,
    s_close: generateCloseG,
    sup_open: pairOpen,
    sup_close: generateCloseG,
};

function pairOpen(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const {markup, tag, type} = tokens[i];
    if (!markup?.length) {
        throw new Error(`markup missing for token: ${type}`);
    }
    if (!tag?.length) {
        throw new Error(`tag missing for token: ${type}`);
    }

    return generateOpenG({ctype: tag, equivText: markup});
}

export {pair};
export default {pair};
