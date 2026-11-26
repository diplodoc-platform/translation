import type {Renderer} from 'markdown-it';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';

import {Liquid} from 'src/skeleton/liquid';
import {stringAttr} from 'src/utils';

export const noTranslate: Renderer['rules'] = {
    no_translate_inline: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const token = tokens[idx];
        const noTranslateContent = Liquid.unescape(stringAttr(token, 'data-content') || '');

        token.skip = [`:no-translate[${noTranslateContent}]`];
        return '';
    },
};
