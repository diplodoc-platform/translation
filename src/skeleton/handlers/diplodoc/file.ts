import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {replacer} from 'src/skeleton/replacer';

import {SkeletonRendererState} from 'src/skeleton/renderer';

function yfmFile(this: MarkdownRenderer<SkeletonRendererState>, tokens: Token[], i: number) {
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
