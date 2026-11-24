import type Renderer from 'markdown-it/lib/renderer';

import {amp} from 'src/symbols';
import {generateCloseG, generateOpenG, generateX} from 'src/xliff/generator';

import {renderLiquid} from './liquid';

export const file: Renderer.RenderRuleRecord = {
    yfm_file: fileRule,
    file_name: fileName,
    file_open: fileMarkup,
    file_close: fileMarkup,
};

function fileMarkup(tokens: Token[], i: number) {
    return protectedMarkup(tokens[i].markup);
}

function protectedMarkup(markup: string) {
    // XML readers normalize literal attribute whitespace to spaces.
    const equivText = markup.replace(/[\r\n\t]/g, (char) => amp + '#' + char.codePointAt(0) + ';');
    return generateX({ctype: 'file_markup', equivText});
}

// A quoted name stays in one XLIFF group even when it spans sentences.
function fileName(tokens: Token[], i: number) {
    const {markup, meta} = tokens[i];
    const quote = markup[0];
    const rawLines = markup.slice(1, -1).split(/(\r?\n)/);
    const lines: {text: string; tokens: Token[]}[] = meta.lines;
    let name = '';

    for (const [index, {text, tokens: children}] of lines.entries()) {
        if (index > 0) {
            const raw = rawLines[2 * index];
            const prefix = raw.slice(0, raw.length - text.length);
            name += protectedMarkup(rawLines[2 * index - 1] + prefix);
        }

        name += children
            .map((child) => (child.type === 'liquid' ? renderLiquid(child) : child.content))
            .join('');
    }

    return (
        generateOpenG({
            ctype: 'file_name',
            equivText: quote + '{{text}}' + quote,
            xBegin: quote,
            xEnd: quote,
        }) +
        name +
        generateCloseG()
    );
}

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

function fileRule(tokens: Token[], i: number) {
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
