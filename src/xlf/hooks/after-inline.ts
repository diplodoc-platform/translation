import MarkdownIt from 'markdown-it';
import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';

import {segmenter} from 'src/xlf/segmenter';
import {gtre, ltre, qtre, slre} from 'src/xlf/symbols';
import {XLFRendererState} from 'src/xlf/state';

const escapeHTML = new MarkdownIt().utils.escapeHtml;

function afterInline(
    this: MarkdownRenderer<XLFRendererState>,
    parameters: CustomRendererHookParameters,
) {
    if (!parameters.rendered) {
        return '';
    }

    let rendered = parameters.rendered.join('');
    if (!rendered.length) {
        return '';
    }

    rendered = escapeHTML(rendered);
    rendered = rendered.replace(gtre, '>').replace(ltre, '<').replace(qtre, '"').replace(slre, '/');
    rendered = segmenter(rendered, this.state);

    parameters.rendered.splice(0, parameters.rendered.length, rendered);

    return '';
}

export {afterInline};
export default {afterInline};
