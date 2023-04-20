import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';

import {MarkdownHandlersState} from './index';
import {replaceHashes} from './replacer';

function imageClose(this: MarkdownRenderer<MarkdownHandlersState>) {
    const token = this.state.image.pending.pop();
    if (token?.type !== 'image') {
        throw new Error('failed to replace image content with hashes');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        return '';
    }

    const {markdown} = this.state;

    const replaced = replaceHashes(title, markdown.translations);

    token.attrSet('title', replaced);

    this.state.image.pending.push(token);

    return '';
}

export {imageClose};
export default {imageClose};
