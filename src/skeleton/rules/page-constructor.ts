import type Renderer from 'markdown-it/lib/renderer';
import type {ValidateFunction} from 'ajv';
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

function processBlock(consumer: Consumer, yaml: string, map: Token['map']) {
    if (!yaml.trim()) {
        return;
    }

    const doc = parseDocument(yaml);
    if (doc.errors.length) {
        // Broken YAML is left in the skeleton as is.
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

        try {
            consumer.process(
                token('text', {content: text}),
                map ? [map[0] + line, map[0] + endLine] : map,
            );
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
