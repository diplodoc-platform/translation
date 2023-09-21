import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';

import {segmenter} from 'src/xlf/segmenter';
import {isTitleRefLink} from 'src/link';

import {XLFRendererState} from 'src/xlf/state';

// disabled for now
// handle ref links {#T}
// src/__fixtures__/links.ts
//
// handle anchors # title {#anchor}
// src/__fixtures__/anchors.ts

function text(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    let rendered = '';

    const insideLink = this.state.link.pending?.length;
    if (insideLink && isTitleRefLink(content)) {
        return rendered;
    }

    rendered += segmenter(content, this.state);

    return rendered;
}

export {text};
export default {text};
