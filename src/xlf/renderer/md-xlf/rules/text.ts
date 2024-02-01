import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';
import {Tokenizer} from 'src/liquid/tokenizer';
import {Renderer as LiquidRenderer} from 'src/liquid';
import {XLFRenderState} from 'src/xlf/renderer/md-xlf/state';

const text: Renderer.RenderRuleRecord = {
    text: textRule,
};

function textRule(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
    const text = tokens[i];

    if (!text.content?.length || text.reflink) {
        return '';
    }

    const tokenizer = new Tokenizer(text.content);
    const liquidTokens = tokenizer.tokenize();
    const renderer = new LiquidRenderer(liquidTokens);

    return renderer.render();
}

export {text};
export default {text};
