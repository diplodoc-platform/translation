import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {generateOpenG, generateCloseG, generateX} from 'src/xlf/generator';

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

const link: Renderer.RenderRuleRecord = {
    link_open: linkOpen,
    link_close: linkClose,
};

function linkOpen(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    this.state.link.pending.push(tokens[i]);

    const rendered = generateOpenG({ctype: 'link_text_part', equivText: '[]'});

    return rendered;
}

function linkClose(this: CustomRenderer<XLFRendererState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to render trans-unit from link');
    }

    let rendered = generateCloseG();

    rendered += generateOpenG({ctype: 'link_attributes_part', equivText: '()'});

    const href = token.attrGet('href');
    if (href?.length) {
        rendered += generateX({ctype: 'link_attributes_href', equivText: `href="${href}"`});
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

export {link, initState};
export default {linkOpen, linkClose, initState};
