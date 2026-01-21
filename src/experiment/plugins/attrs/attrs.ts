import type MarkdownIt from 'markdown-it';

import attrs from './markdown-it-attrs';

const leftDelimiter = '{#';
const rightDelimiter = '}';

export function attrsPlugin(md: MarkdownIt) {
    md.use(attrs, {leftDelimiter, rightDelimiter});
}
