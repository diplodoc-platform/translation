import type {CustomRendererHookParameters} from 'src/renderer';

import {token} from 'src/utils';
import {tableTitleParts} from 'src/utils/table-title';
import {Liquid} from 'src/skeleton/liquid';

/**
 * Extract human-readable titles from standalone wide-table attributes only.
 * @returns No rendered output; the hook updates inline tokens.
 */
export function tableTitle({tokens}: CustomRendererHookParameters) {
    for (const [index, block] of tokens.entries()) {
        if (block.type !== 'inline' || tokens[index - 1]?.type !== 'paragraph_open') {
            continue;
        }
        const parts = tableTitleParts(block.content);
        if (!parts) {
            continue;
        }
        const [prefix, title, suffix] = parts;
        block.children = [
            token('liquid', {
                content: '',
                skip: Liquid.unescape(prefix),
                subtype: 'Attributes',
                generated: 'liquid',
            }),
            token('text', {content: title}),
            token('liquid', {
                content: '',
                skip: Liquid.unescape(suffix),
                subtype: 'Attributes',
                generated: 'liquid',
            }),
        ];
    }
    return '';
}
