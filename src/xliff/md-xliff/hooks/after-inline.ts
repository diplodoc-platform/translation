import type {CustomRendererHookParameters} from 'src/renderer';
import MarkdownIt from 'markdown-it';
import {unescapeSymbols} from 'src/xliff/symbols';

const escapeHTML = new MarkdownIt().utils.escapeHtml;

export function afterInline(parameters: CustomRendererHookParameters) {
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
