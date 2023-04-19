import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';

import {transUnit} from 'src/xlf/generator';
import {XLFRulesState} from './index';

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

// eslint-disable-next-line camelcase
function linkOpen(this: CustomRenderer<XLFRulesState>, tokens: Token[], i: number) {
    this.state.link.pending.push(tokens[i]);

    return '';
}

// eslint-disable-next-line camelcase
function linkClose(this: CustomRenderer<XLFRulesState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to render trans-unit from link');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        return '';
    }

    const {xlf} = this.state;

    let rendered = '';

    rendered += transUnit.generate({source: title, id: xlf.id, indentation: xlf.indentation});

    rendered += '\n';

    this.state.xlf.id++;

    return rendered;
}

// eslint-disable-next-line camelcase
export {linkOpen, linkClose, initState};
// eslint-disable-next-line camelcase
export default {linkOpen, linkClose, initState};
