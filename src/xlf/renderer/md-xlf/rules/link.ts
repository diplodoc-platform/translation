import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateOpenG, generateCloseG, generateX} from 'src/xlf/generator';

export type LinkRuleState = {
    link: {
        pending: Array<Token>;
        reflink: boolean;
    };
};

function initState() {
    return {
        link: {
            pending: new Array<Token>(),
            reflink: false,
        },
    };
}

const link: Renderer.RenderRuleRecord = {
    link_open: linkOpen,
    link_close: linkClose,
};

function linkOpen(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    this.state.link.pending.push(tokens[i]);

    const reflink = isRefLink(tokens, i);
    if (reflink) {
        this.state.link.reflink = reflink;

        return '';
    }

    const rendered = generateOpenG({ctype: 'link_text_part', equivText: '[]'});

    return rendered;
}

function linkClose(this: CustomRenderer<XLFRendererState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to render trans-unit from link');
    }

    let rendered = '';
    if (this.state.link.reflink) {
        rendered += generateX({ctype: 'link_reflink', equivText: '[{#T}]'});
        this.state.link.reflink = false;
    } else {
        rendered += generateCloseG();
    }

    rendered += generateOpenG({ctype: 'link_attributes_part', equivText: '()'});

    const href = token.attrGet('href');
    if (href?.length) {
        rendered += generateX({ctype: 'link_attributes_href', equivText: `${href}`});
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        this.state.link.pending.push(token);

        rendered += generateCloseG();

        return rendered;
    }

    rendered += generateOpenG({ctype: 'link_attributes_title', equivText: '""'});
    rendered += title;
    rendered += generateCloseG();

    rendered += generateCloseG();

    return rendered;
}

function isRefLink(tokens: Token[], i: number) {
    const open: Token = tokens[i];
    if (open?.type !== 'link_open') {
        return false;
    }

    const text: Token = tokens[i + 1];
    if (text?.type !== 'text') {
        return false;
    }

    const close: Token = tokens[i + 2];
    if (close?.type !== 'link_close') {
        return false;
    }

    return text?.content === '{#T}';
}

export {link, initState};
export default {linkOpen, linkClose, initState};
