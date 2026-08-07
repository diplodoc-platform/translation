import type Renderer from 'markdown-it/lib/renderer';
import type {ValidateFunction} from 'ajv';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';

import Ajv from 'ajv';
import {load} from 'js-yaml';
import {pageConstructorSchemaJson} from '@diplodoc/ajv';

import {genCode} from 'src/json/translate';
import {token} from 'src/utils';
import {Liquid} from 'src/skeleton/liquid';

// The validator is compiled once (the schema is large), so the collected
// translatable strings are exchanged through this module-level buffer.
let collected: string[] = [];
let validator: ValidateFunction | null = null;

function getValidator() {
    if (!validator) {
        const ajv = new Ajv({
            strictSchema: false,
            validateSchema: false,
            validateFormats: false,
            strict: false,
            allErrors: true,
            $data: true,
        });

        ajv.addKeyword({
            keyword: 'translate',
            type: ['string', 'object', 'array'],
            code: genCode((text) => {
                if (/^%%%\d+%%%$/.test(text)) {
                    return text;
                }

                collected.push(text);

                // Mark the value as processed to guard against repeated
                // evaluation of the same data node (anyOf/oneOf branches).
                return `%%%${collected.length - 1}%%%`;
            }),
        });

        validator = ajv.compile(pageConstructorSchemaJson);
    }

    return validator;
}

type Anchor = {
    at: number;
    text: string;
};

/**
 * A claimed occurrence must look like a whole YAML scalar, not a fragment
 * of another value: on its line it may only be preceded by a key separator,
 * a list dash or the line start (plus an opening quote and indentation).
 */
function isScalarStart(yaml: string, index: number): boolean {
    let i = index - 1;
    if (yaml[i] === "'" || yaml[i] === '"') {
        i--;
    }
    while (i >= 0 && (yaml[i] === ' ' || yaml[i] === '\t')) {
        i--;
    }

    return i < 0 || yaml[i] === ':' || yaml[i] === '-' || yaml[i] === '\n';
}

/**
 * The scalar counterpart of `isScalarStart`: after the occurrence (and an
 * optional closing quote) only a line break, a flow terminator or a comment
 * may follow. Rejects occurrences that are prefixes of longer values.
 */
function isScalarEnd(yaml: string, index: number): boolean {
    let i = index;
    if (yaml[i] === "'" || yaml[i] === '"') {
        i++;
    }
    while (i < yaml.length && (yaml[i] === ' ' || yaml[i] === '\t')) {
        i++;
    }

    return i >= yaml.length || '\n\r,]}#'.includes(yaml[i]);
}

/**
 * Finds the first occurrence of the value that is not inside an already
 * claimed range and looks like a whole scalar. Returns -1 when the value
 * has no verbatim occurrence (folded scalars, escaped quoting).
 */
function claimOccurrence(yaml: string, text: string, claimed: [number, number][]): number {
    let from = 0;
    while (from <= yaml.length - text.length) {
        const at = yaml.indexOf(text, from);
        if (at === -1) {
            return -1;
        }
        from = at + 1;

        const end = at + text.length;
        if (claimed.some(([start, stop]) => at < stop && end > start)) {
            continue;
        }
        if (!isScalarStart(yaml, at) || !isScalarEnd(yaml, end)) {
            continue;
        }

        return at;
    }

    return -1;
}

/**
 * Assigns every value its own occurrence in the block. Longer values claim
 * first, so a value that is a substring of another one (title: 'Product'
 * next to description: 'Product Pro') cannot steal the longer value's
 * position and corrupt it. Repeated values claim consecutive occurrences.
 */
function claimAnchors(yaml: string, strings: string[]): {anchored: Anchor[]; loose: string[]} {
    const claimed: [number, number][] = [];
    const anchored: Anchor[] = [];
    const loose: string[] = [];

    const byLength = strings
        .map((text, index) => ({text, index}))
        .sort((a, b) => b.text.length - a.text.length || a.index - b.index);

    for (const {text} of byLength) {
        const at = claimOccurrence(yaml, text, claimed);
        if (at === -1) {
            loose.push(text);
        } else {
            claimed.push([at, at + text.length]);
            anchored.push({at, text});
        }
    }

    anchored.sort((a, b) => a.at - b.at);

    return {anchored, loose};
}

function processBlock(consumer: Consumer, yaml: string, map: Token['map']) {
    if (!yaml.trim()) {
        return;
    }

    let data: unknown;
    try {
        data = load(yaml);
    } catch {
        // Broken YAML is left in the skeleton as is.
        return;
    }

    if (!data || typeof data !== 'object') {
        return;
    }

    collected = [];
    try {
        getValidator()(data as object);
    } catch {
        // Best effort: values collected before the failure are still processed.
    }

    const strings = collected;
    collected = [];

    const {anchored, loose} = claimAnchors(
        yaml,
        strings.filter((text) => text.trim() && !text.includes('\n')),
    );

    // Anchored values are processed in their textual order (the consumer
    // matches strictly forward), each within the window of its own line,
    // so the consumer cannot match a fragment of a neighboring value.
    // The token map points at the block content, so line offsets inside
    // the yaml translate directly into document lines.
    let line = map ? map[0] : 0;
    let scanned = 0;
    for (const {at, text} of anchored) {
        while (scanned < at) {
            if (yaml[scanned] === '\n') {
                line++;
            }
            scanned++;
        }

        try {
            consumer.process(token('text', {content: text}), map ? [line, line] : map);
        } catch {
            // The value was not found in the source block. It stays untranslated.
        }
    }

    // Values without a verbatim occurrence (folded scalars) are matched
    // last across the whole block, best effort: the consumer cursor is
    // already past the anchored values, so only trailing ones can match.
    for (const text of loose) {
        try {
            consumer.process(token('text', {content: text}), map);
        } catch {
            // The value was not found in the source block. It stays untranslated.
        }
    }
}

export const pageConstructor: Renderer.RenderRuleRecord = {
    page_constructor: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const {content, map} = tokens[idx];

        processBlock(this.state, Liquid.unescape(content || ''), map);

        return '';
    },
};
