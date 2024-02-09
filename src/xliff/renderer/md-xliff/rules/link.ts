import type {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import type {XLFRenderState} from 'src/xliff/renderer/md-xliff';
import type Renderer from 'markdown-it/lib/renderer';

import { generateCloseG, generateOpenG, generateX } from 'src/xliff/generator';

export type LinkRuleState = {
    link: {
        map: Map<Token, Token>;
    };
};

export const link: Renderer.RenderRuleRecord = {
    link_auto: linkAuto,
    link_open: linkOpen,
    link_close: linkClose,
};

function linkAuto(tokens: Token[], i: number) {
    const href = tokens[i].content;

    return generateX({
        ctype: 'link_autolink',
        equivText: `${href}`,
    });
}

function linkOpen(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
    const open = tokens[i];

    if (open.g) {
        const title = open.attrGet('title');
        const href = open.attrGet('href');

        const begin = '[' + (open.reflink ? '{#T}' : '');
        const end = '](' + [
            href,
            title && '"' + title + '"',
        ].filter(Boolean).join(' ') + ')';

        return generateOpenG({
            ctype: 'link',
            equivText: `${begin}{{text}}${end}`,
            'x-begin': begin,
            'x-end': end,
        });
    } else {
        if (open.reflink) {
            return '';
        }

        return generateX({
            ctype: 'link_text_part_open',
            equivText: '[',
        });
    }
}

function linkClose(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
    const close = tokens[i];
    if (close.g) {
        return generateCloseG();
    }

    const open = this.state.link.map.get(close) as Token;
    const title = open.attrGet('title');
    const href = open.attrGet('href');

    let rendered = '';
    if (open.reflink) {
        rendered += generateX({
            ctype: 'link_reflink',
            equivText: '[{#T}]',
        });
    } else {
        rendered += generateX({
            ctype: 'link_text_part_close',
            equivText: ']',
        });
    }

    rendered += generateX({
        ctype: 'link_attributes_part_open',
        equivText: '(',
    });

    if (href?.length) {
        rendered += generateX({
            ctype: 'link_attributes_href',
            equivText: href,
        });
    }

    if (title?.length) {
        rendered += generateX({
            ctype: 'link_attributes_title',
            equivText: title,
        });
    }

    rendered += generateX({
        ctype: 'link_attributes_part_close',
        equivText: ')',
    });

    return rendered;
}
