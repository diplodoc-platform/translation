import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {replacer} from 'src/markdown/replacer';

import {MarkdownRendererState} from 'src/markdown/renderer';

function yfmFile(this: MarkdownRenderer<MarkdownRendererState>, tokens: Token[], i: number) {
    const token = tokens[i];
    const content = token.content;

    if (!content?.length) {
        return '';
    }

    token.attrSet('download', replacer(content, this.state));

    return '';
}

export {yfmFile};
export default {yfmFile};
