import type {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import type {XLFRenderState} from 'src/xliff/renderer/md-xliff';
import type Renderer from 'markdown-it/lib/renderer';
import type Token from 'markdown-it/lib/token';

import {generateX} from 'src/xliff/generator';

export const file: Renderer.RenderRuleRecord = {
    yfm_file: fileRule,
};

const attributes = new Map<string, string>([
    ['href', 'src'],
    ['download', 'name'],
    ['hreflang', 'lang'],
    ['type', 'type'],
    ['target', 'target'],
    ['rel', 'rel'],
    ['referrerpolicy', 'referrerpolicy'],
]);

const translatable = new Set(['download']);

function fileRule(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
    const {attrs} = tokens[i];
    if (!attrs?.length) {
        throw new Error(`failed to render token: ${tokens[i]}`);
    }

    let rendered = generateX({
        ctype: 'file_open',
        equivText: '{%',
    });

    for (const [key, val] of attrs) {
        const attribute = attributes.get(key);
        if (!attribute?.length) {
            continue;
        }

        const ctype = `file_${attribute}`;
        const equivText = `${attribute}="${val}"`;
        if (translatable.has(key)) {
            rendered += generateX({
                ctype: `${ctype}_open`,
                equivText: `${attribute}="`,
            });
            rendered += val;
            rendered += generateX({
                ctype: `${ctype}_close`,
                equivText: '"',
            });
        } else {
            rendered += generateX({ctype, equivText});
        }
    }

    rendered += generateX({
        ctype: 'file_close',
        equivText: '%}',
    });

    return rendered;
}
