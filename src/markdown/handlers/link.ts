import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';

import {replacer} from 'src/markdown/replacer';

import {MarkdownRendererState} from 'src/markdown/renderer';

function linkClose(this: MarkdownRenderer<MarkdownRendererState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to replace link content with hashes');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        this.state.link.pending.push(token);
        return '';
    }

    token.attrSet('title', replacer(title, this.state));

    this.state.link.pending.push(token);

    return '';
}

export {linkClose};
export default {linkClose};
