import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';
import {segmenter} from 'src/xlf/segmenter';

import {XLFRendererState} from 'src/xlf/state';

function afterInline(
    this: MarkdownRenderer<XLFRendererState>,
    parameters: CustomRendererHookParameters,
) {
    if (!parameters.rendered) {
        return '';
    }

    const artifact = parameters.rendered.join('');
    if (!artifact.length) {
        return '';
    }

    const generated = segmenter(artifact, this.state);

    parameters.rendered.splice(0, parameters.rendered.length, generated);

    return '';
}

export {afterInline};
export default {afterInline};
