import type Renderer from 'markdown-it/lib/renderer';
import type {ValidateFunction} from 'ajv';
import type {YAMLError} from 'yaml';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';

import Ajv from 'ajv';
import {isScalar, parseDocument} from 'yaml';
import {pageConstructorSchemaJson} from '@diplodoc/ajv';

import {token} from 'src/utils';
import {Liquid} from 'src/skeleton/liquid';

// The validator is compiled once (the schema is large), so the collected
// translatable paths are exchanged through this module-level buffer.
// Keyed by instance path: anyOf branches may visit the same node twice.
let collected = new Map<string, string>();
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
            // Skipping codegen optimization compiles the large schema ~2.5x
            // faster; the validator runs once per block, so its own speed
            // does not matter.
            code: {optimize: false},
        });

        ajv.addKeyword({
            keyword: 'translate',
            type: ['string', 'object', 'array'],
            validate: function (
                _schema: unknown,
                value: unknown,
                _parent?: unknown,
                ctx?: {instancePath: string},
            ) {
                if (typeof value === 'string' && value.trim() && ctx) {
                    collected.set(ctx.instancePath, value);
                }

                return true;
            },
        });

        validator = ajv.compile(pageConstructorSchemaJson);
    }

    return validator;
}

type Anchor = {
    at: number;
    end: number;
    text: string;
};

function unescapePointer(segment: string): string {
    return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * Resolves collected instance paths into exact character ranges of the
 * scalar nodes inside the yaml source. Position-based addressing cannot
 * confuse a value with an equal or overlapping text in another field.
 * Aliased nodes resolve into their anchor and are translated once.
 */
function resolveAnchors(
    doc: ReturnType<typeof parseDocument>,
    paths: Map<string, string>,
): Anchor[] {
    const seen = new Set<number>();
    const anchors: Anchor[] = [];

    for (const [pointer, text] of paths) {
        const path = pointer.split('/').slice(1).map(unescapePointer);
        const node = doc.getIn(path, true);
        if (!isScalar(node) || node.value !== text || !node.range) {
            continue;
        }

        const [at, end] = node.range;
        if (seen.has(at)) {
            continue;
        }
        seen.add(at);

        anchors.push({at, end, text});
    }

    return anchors.sort((a, b) => a.at - b.at);
}

// A liquid tag alone on its line, like `{% if distr == "saas" %}` between cards.
const LIQUID_LINE = /^[ \t]*\{%.*%\}\s*$/;

/**
 * The build applies liquid conditions before the page constructor parses
 * its yaml, so conditions between list items break the parsing here.
 * Tag lines the parser fails on are turned into comments of the same
 * length: offsets and lines stay in place, so values are still found in
 * the source, and the tags stay in the skeleton. A blank line would not
 * do: its spaces continue a block scalar right above it. A tag line inside
 * a block scalar is a part of its text and does not fail the parser, so it
 * is left as is.
 */
function parseYaml(yaml: string) {
    let doc = parseDocument(yaml);

    while (doc.errors.length) {
        let commented = yaml;
        for (const {pos} of doc.errors) {
            const start = yaml.lastIndexOf('\n', pos[0] - 1) + 1;
            const end = yaml.indexOf('\n', pos[0]);
            const line = yaml.slice(start, end === -1 ? yaml.length : end);

            if (LIQUID_LINE.test(line)) {
                commented =
                    commented.slice(0, start) +
                    line.replace(/\{%.*%\}/, (tag) => '#' + ' '.repeat(tag.length - 1)) +
                    commented.slice(start + line.length);
            }
        }

        if (commented === yaml) {
            break;
        }

        yaml = commented;
        doc = parseDocument(yaml);
    }

    return doc;
}

/**
 * A single line: tools downstream read warnings line by line.
 */
function parseErrorWarning(yaml: string, map: Token['map'], error: YAMLError) {
    const reason = error.message.split('\n')[0].replace(/ at line \d+, column \d+:?$/, '');
    if (!map) {
        return `page-constructor block is left untranslated: ${reason}`;
    }

    // The content starts on the line after the directive, so the zero-based
    // first content line is the one-based line of the directive.
    const line = map[0] + yaml.slice(0, error.pos[0]).split('\n').length;

    return `page-constructor block at line ${map[0]} is left untranslated: ${reason} (line ${line})`;
}

function processBlock(consumer: Consumer, yaml: string, map: Token['map']) {
    if (!yaml.trim()) {
        return;
    }

    const doc = parseYaml(yaml);
    if (doc.errors.length) {
        // Broken YAML is left in the skeleton as is.
        consumer.warnings.push(parseErrorWarning(yaml, map, doc.errors[0]));
        return;
    }

    const data = doc.toJS();
    if (!data || typeof data !== 'object') {
        return;
    }

    collected = new Map();
    try {
        getValidator()(data);
    } catch {
        // Best effort: values collected before the failure are still processed.
    }

    const paths = collected;
    collected = new Map();

    // Anchors are processed in their textual order (the consumer matches
    // strictly forward), each within the window of its own lines, so the
    // consumer cannot cross into neighboring scalars. The token map points
    // at the block content, so yaml offsets translate into document lines.
    let line = 0;
    let scanned = 0;
    for (const {at, end, text} of resolveAnchors(doc, paths)) {
        while (scanned < at) {
            if (yaml[scanned] === '\n') {
                line++;
            }
            scanned++;
        }

        let endLine = line;
        for (let i = at; i < end && i < yaml.length; i++) {
            if (yaml[i] === '\n') {
                endLine++;
            }
        }

        // Liquid tags in a single-line value (a folded scalar included) are
        // split out like in the markdown text, so they stay in the skeleton
        // instead of the unit. A multi-line value is matched as plain text
        // sentence by sentence: split tokens would have to match the scalar
        // indentation as is. Other values keep their variables in the text,
        // as their units always had.
        const tokens =
            text.includes('{%') && !text.includes('\n')
                ? new Liquid(text).tokenize()
                : token('text', {content: text});

        try {
            consumer.process(tokens, map ? [map[0] + line, map[0] + endLine] : map);
        } catch {
            // The value cannot be matched in the source block (escaped
            // quoting, literal block scalars). It stays untranslated.
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
