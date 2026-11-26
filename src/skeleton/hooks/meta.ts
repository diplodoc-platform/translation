import type {CustomRenderer, CustomRendererHookParameters} from 'src/renderer';
import type {Consumer} from 'src/consumer';
import type {MarkdownIt} from 'markdown-it';

import {envMeta} from '@diplodoc/transform/document';

import {token} from 'src/utils';

import {Liquid} from '../liquid';

const authoredMeta = Symbol('translation.authoredMeta');

export function metaPlugin(md: MarkdownIt) {
    envMeta({
        core: md.core,
        block: {
            ruler: {
                before(anchor, name, rule, options) {
                    md.block.ruler.before(
                        anchor,
                        name,
                        (state, start, end) => {
                            const matched = rule(state, start, end);

                            if (matched) {
                                // Preserve authored YAML before body plugins append resource metadata.
                                Object.defineProperty(state.env, authoredMeta, {
                                    value: structuredClone(state.env.meta),
                                    configurable: true,
                                });
                            }

                            return matched;
                        },
                        options,
                    );
                },
            },
        },
    });
}

export function meta(this: CustomRenderer<Consumer>, {env}: CustomRendererHookParameters) {
    if (!env || typeof env !== 'object' || !(authoredMeta in env)) {
        return '';
    }

    traverse(env[authoredMeta], (value, key) => {
        const tokenizer = new Liquid(value);
        this.state.process(token('fake', {skip: key}));
        this.state.process([...tokenizer.tokenize()]);
    });

    return '';
}

function traverse(
    meta: unknown,
    fn: (val: string, key: string | null | undefined) => void,
    key?: string | null,
) {
    if (typeof meta === 'string') {
        fn(meta, key);
    } else if (Array.isArray(meta)) {
        for (const val of meta) {
            traverse(val, fn);
        }
    } else if (meta && typeof meta === 'object') {
        for (const [key, val] of Object.entries(meta)) {
            traverse(val, fn, key);
        }
    }
}
