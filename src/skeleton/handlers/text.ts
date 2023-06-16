import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {replacer} from 'src/skeleton/replacer';
import {isAnchor} from 'src/anchor';

import {SkeletonHandlersState} from './index';

function text(this: MarkdownRenderer<SkeletonHandlersState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    if (isAnchor(content)) {
        return '';
    }

    tokens[i].content = replacer(content, this.state);

    return '';
}

export {text};
export default {text};
