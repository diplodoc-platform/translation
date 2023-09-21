import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';

import {segmenter} from 'src/xlf/segmenter';

import {XLFRendererState} from 'src/xlf/state';

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

    return '';
}

function linkClose(this: CustomRenderer<XLFRendererState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to render trans-unit from link');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        this.state.link.pending.push(token);
        return '';
    }

    let rendered = '';

    rendered += segmenter(title, this.state);

    return rendered;
}

export {linkOpen, linkClose, initState};
export default {linkOpen, linkClose, initState};
