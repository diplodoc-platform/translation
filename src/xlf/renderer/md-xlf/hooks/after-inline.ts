import MarkdownIt from 'markdown-it';
import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';
import {segmenter} from 'src/xlf/renderer/md-xlf/segmenter';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';
import {unescapeSymbols} from 'src/xlf/symbols';

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
    rendered = unescapeSymbols(rendered);
    rendered = segmenter(rendered, this.state);

    parameters.rendered.splice(0, parameters.rendered.length, rendered);

    return '';
}

export {afterInline};
export default {afterInline};
