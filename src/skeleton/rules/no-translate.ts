import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';

import {Liquid} from 'src/skeleton/liquid';

export const noTranslate: Renderer.RenderRuleRecord = {
    no_translate_inline: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const token = tokens[idx];
        const noTranslateContent = Liquid.unescape(token.attrGet('data-content') || '');

        token.skip = [`:no-translate[${noTranslateContent}]`];
        return '';
    },
};
