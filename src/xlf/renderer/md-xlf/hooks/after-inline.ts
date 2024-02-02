import MarkdownIt from 'markdown-it';
import {CustomRenderer, CustomRendererHookParams} from '@diplodoc/markdown-it-custom-renderer';

import {XLFRenderState} from 'src/xlf/renderer/md-xlf/state';
import {unescapeSymbols} from 'src/xlf/symbols';

const escapeHTML = new MarkdownIt().utils.escapeHtml;

export function afterInline(
    this: CustomRenderer<XLFRenderState>,
    parameters: CustomRendererHookParams,
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

    parameters.rendered.splice(0, parameters.rendered.length, rendered);

    return '';
}
