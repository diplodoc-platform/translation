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

    // The schema walks data in its own order, while the consumer
    // matches strictly forward. Sort values by their position in
    // the block to keep the cursor monotonic. Values without a
    // verbatim occurrence (folded scalars) are matched last.
    const positioned = strings
        .filter((text) => !text.includes('\n'))
        .map((text) => {
            const at = yaml.indexOf(text);
            return [at === -1 ? Infinity : at, text] as [number, string];
        })
        .sort((a, b) => a[0] - b[0]);

    for (const [, text] of positioned) {
        try {
            consumer.process(token('text', {content: text}), map);
        } catch {
            // The value was not found in the source block
            // (quoting, escaping). It stays untranslated.
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
