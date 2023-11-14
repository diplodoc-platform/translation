import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';

import {generateCloseG, generateOpenG, generateX} from 'src/xlf/generator';

const file: Renderer.RenderRuleRecord = {
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

function fileRule(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const {attrs} = tokens[i];
    if (!attrs?.length) {
        throw new Error(`failed to render token: ${tokens[i]}`);
    }

    let rendered = generateOpenG({ctype: 'file', equivText: '{%%}'});

    for (const [key, val] of attrs) {
        const attribute = attributes.get(key);
        if (!attribute?.length) {
            continue;
        }

        const ctype = `file_${attribute}`;
        const equivText = ` ${attribute}="${val}"`;
        if (translatable.has(key)) {
            rendered += generateOpenG({ctype, equivText: '""'});
            rendered += val;
            rendered += generateCloseG();
        } else {
            rendered += generateX({ctype, equivText});
        }
    }

    rendered += generateCloseG();

    return rendered;
}

export {file};
export default {file};