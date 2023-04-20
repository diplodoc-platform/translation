import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownHandlersState} from './index';
import {replaceHashes} from './replacer';

function text(this: MarkdownRenderer<MarkdownHandlersState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    const {markdown} = this.state;

    const replaced = replaceHashes(content, markdown.translations);

    tokens[i].content = replaced;

    return '';
}

export {text};
export default {text};
