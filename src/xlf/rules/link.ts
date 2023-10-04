import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/state';
import {gt, lt, qt, sl} from 'src/xlf/symbols';

export type LinkRuleState = {
    link: {
        pending: Array<Token>;
    };
};

function initState() {
    return {
        link: {
            pending: new Array<Token>(),
        },
    };
}

function linkOpen(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    this.state.link.pending.push(tokens[i]);

    return `${lt}g ctype=${qt}x-[-]${qt}${gt}`;
}

function linkClose(this: CustomRenderer<XLFRendererState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to render trans-unit from link');
    }

    let rendered = `${lt}${sl}g${gt}${lt}g ctype=${qt}x-(-)${qt}${gt}`;

    const href = token.attrGet('href');
    if (href?.length) {
        rendered += `${lt}x ctype=${qt}x-link-href${qt} equiv-text=${qt}${href}${qt} ${sl}${gt}`;
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        this.state.link.pending.push(token);
    } else {
        rendered += `${lt}g ctype=${qt}x-"-"${qt}${gt}${title}${lt}${sl}g${gt}`;
    }

    rendered += `${lt}${sl}g${gt}`;

    return rendered;
}

export {linkOpen, linkClose, initState};
export default {linkOpen, linkClose, initState};
