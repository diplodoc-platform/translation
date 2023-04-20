import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';

import {MarkdownHandlersState} from './index';
import {replaceHashes} from './replacer';

function linkClose(this: MarkdownRenderer<MarkdownHandlersState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to replace link content with hashes');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        return '';
    }

    const {markdown} = this.state;

    const replaced = replaceHashes(title, markdown.translations);

    token.attrSet('title', replaced);

    this.state.link.pending.push(token);

    return '';
}

export {linkClose};
export default {linkClose};
