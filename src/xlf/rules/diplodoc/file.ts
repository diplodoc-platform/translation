import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';

import {segmenter} from 'src/xlf/segmenter';

import {XLFRendererState} from 'src/xlf/renderer';

function yfmFile(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    let rendered = '';

    rendered += segmenter(content, this.state);

    return rendered;
}

export {yfmFile};
export default {yfmFile};
