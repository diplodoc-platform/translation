import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';

// disabled for now
// handle ref links {#T}
// src/__fixtures__/links.ts
//
// handle anchors # title {#anchor}
// src/__fixtures__/anchors.ts
//

const text: Renderer.RenderRuleRecord = {
    text: textRule,
};

function textRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    const insideLink = this.state.link.pending?.length;
    const reflink = this.state.link.reflink;
    if (!content?.length || (insideLink && reflink)) {
        return '';
    }

    return content;
}

export {text};
export default {text};
