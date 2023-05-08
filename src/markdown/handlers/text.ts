import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {replacer} from 'src/markdown/replacer';

import {MarkdownHandlersState} from './index';

function text(this: MarkdownRenderer<MarkdownHandlersState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    tokens[i].content = replacer(content, this.state);

    return '';
}

export {text};
export default {text};
