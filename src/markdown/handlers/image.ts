import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';

import {replacer} from 'src/markdown/replacer';

import {MarkdownRendererState} from 'src/markdown/renderer';

function imageClose(this: MarkdownRenderer<MarkdownRendererState>) {
    const token = this.state.image.pending.pop();
    if (token?.type !== 'image') {
        throw new Error('failed to replace image content with hashes');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        this.state.image.pending.push(token);
        return '';
    }

    token.attrSet('title', replacer(title, this.state));

    this.state.image.pending.push(token);

    return '';
}

export {imageClose};
export default {imageClose};
