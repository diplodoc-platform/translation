import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';

import {replacer} from './replacer';

import {MarkdownHandlersState} from './index';

function linkClose(this: MarkdownRenderer<MarkdownHandlersState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to replace link content with hashes');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        return '';
    }

    token.attrSet('title', replacer(title, this.state));

    this.state.link.pending.push(token);

    return '';
}

export {linkClose};
export default {linkClose};
