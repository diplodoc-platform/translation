import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {replacer} from 'src/markdown/replacer';

import {MarkdownRendererState} from 'src/markdown/renderer';

function text(this: MarkdownRenderer<MarkdownRendererState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    // eslint-disable-next-line no-param-reassign
    tokens[i].content = replacer(content, this.state);

    return '';
}

export {text};
export default {text};
