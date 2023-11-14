import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';
import {Tokenizer} from 'src/liquid/tokenizer';
import {Renderer as LiquidRenderer} from 'src/liquid';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';

const text: Renderer.RenderRuleRecord = {
    text: textRule,
};

function textRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    const insideLink = this.state.link.pending?.length;
    const reflink = this.state.link.reflink;
    const autolink = this.state.link.autolink;
    if (!content?.length || (insideLink && (reflink || autolink))) {
        return '';
    }

    const tokenizer = new Tokenizer(content);
    const liquidTokens = tokenizer.tokenize();
    const renderer = new LiquidRenderer(liquidTokens);

    return renderer.render();
}

export {text};
export default {text};
