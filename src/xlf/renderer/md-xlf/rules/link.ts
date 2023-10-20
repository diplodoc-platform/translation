import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import MarkdownIt from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateOpenG, generateCloseG, generateX} from 'src/xlf/generator';

const decodeURL = new MarkdownIt().utils.lib.mdurl.decode;

export type LinkRuleState = {
    link: {
        pending: Array<Token>;
        reflink: boolean;
        autolink: boolean;
    };
};

function initState() {
    return {
        link: {
            pending: new Array<Token>(),
            reflink: false,
            autolink: false,
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

    const autolink = isAutolink(tokens, i);
    if (isAutolink(tokens, i)) {
        this.state.link.autolink = autolink;

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

    let href = token.attrGet('href');
    if (href?.length) {
        href = decodeURL(href);
    }

    let rendered = '';
    if (this.state.link.reflink) {
        rendered += generateX({ctype: 'link_reflink', equivText: '[{#T}]'});
        this.state.link.reflink = false;
    } else if (this.state.link.autolink) {
        rendered += generateX({ctype: 'link_autolink', equivText: `<${href}>`});

        this.state.link.autolink = false;

        return rendered;
    } else {
        rendered += generateCloseG();
    }

    rendered += generateOpenG({ctype: 'link_attributes_part', equivText: '()'});

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

function isAutolink(tokens: Token[], i: number) {
    return tokens[i].markup === 'autolink';
}

export {link, initState};
export default {linkOpen, linkClose, initState};
