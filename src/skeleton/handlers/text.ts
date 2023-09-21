import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {replacer} from 'src/skeleton/replacer';
import {isAnchor} from 'src/anchor';
import {isTitleRefLink} from 'src/link';

import {SkeletonRendererState} from 'src/skeleton/renderer';

// disabled for now
// handle ref links {#T}
// src/__fixtures__/links.ts
//
// handle anchors # title {#anchor}
// src/__fixtures__/anchors.ts

function text(this: MarkdownRenderer<SkeletonRendererState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    if (isAnchor(content)) {
        return '';
    }

    const insideLink = this.state.link.pending?.length;
    if (insideLink && isTitleRefLink(content)) {
        return '';
    }

    tokens[i].content = replacer(content, this.state);

    return '';
}

export {text};
export default {text};
