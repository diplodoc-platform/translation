import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateX} from 'src/xlf/generator';
import {Tokenizer} from 'src/liquid/tokenizer';
import {Renderer as LiquidRenderer} from 'src/liquid';

const codeInline: Renderer.RenderRuleRecord = {
    code_inline: codeInlineRule,
};

function codeInlineRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const {markup, content, tag, type} = tokens[i];
    if (!markup?.length) {
        throw new Error(`markup missing for token: ${type}`);
    }

    const tokenizer = new Tokenizer(content);
    const liquidTokens = tokenizer.tokenize();
    const renderer = new LiquidRenderer(liquidTokens);

    let rendered = '';

    rendered += generateX({
        ctype: `${tag}_open`,
        equivText: '`',
    });

    rendered += renderer.render();

    rendered += generateX({
        ctype: `${tag}_close`,
        equivText: '`',
    });

    return rendered;
}

export {codeInline};
export default {codeInline};
