import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';
import {sentenize} from '@diplodoc/sentenizer';

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

function linkOpen(this: CustomRenderer<XLFRulesState>, tokens: Token[], i: number) {
    this.state.link.pending.push(tokens[i]);

    return '';
}

function linkClose(this: CustomRenderer<XLFRulesState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to render trans-unit from link');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        this.state.link.pending.push(token);
        return '';
    }

    const {xlf} = this.state;

    let rendered = '';

    for (const segment of sentenize(title)) {
        rendered += transUnit.generate({
            indentation: xlf.indentation,
            source: segment,
            id: xlf.id,
        });

        rendered += '\n';

        this.state.xlf.id++;
    }

    return rendered;
}

export {linkOpen, linkClose, initState};
export default {linkOpen, linkClose, initState};
