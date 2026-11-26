import type {MarkdownIt} from 'markdown-it';

import footnotes from '@diplodoc/transform/plugins/footnotes';
import taskList from '@diplodoc/transform/plugins/task-list';

/**
 * Source projection of the canonical registered footnote and task-list grammar.
 * @param md - Actual native parser used by the Translation consumer.
 * @returns Nothing; installs source-preserving grammar projections for Translation.
 */
export function sourceSyntax(md: MarkdownIt) {
    const parse = md.parse;
    const parseInline = md.parseInline;
    const parseDescriptor = Object.getOwnPropertyDescriptor(md, 'parse');
    const parseInlineDescriptor = Object.getOwnPropertyDescriptor(md, 'parseInline');
    const renderDescriptor = Object.getOwnPropertyDescriptor(md.renderer, 'render');
    const rulesDescriptor = Object.getOwnPropertyDescriptor(md.renderer, 'rules');
    const inlineRuler = md.inline.ruler;
    const after = inlineRuler.after;
    const afterDescriptor = Object.getOwnPropertyDescriptor(inlineRuler, 'after');
    let references = 0;
    inlineRuler.after = (anchor, name, rule, options) => {
        if (name !== 'footnote_ref') {
            return after.call(inlineRuler, anchor, name, rule, options);
        }
        references++;
        const sourceRule: typeof rule = (state, silent) => {
            const start = state.pos;
            const count = state.tokens.length;
            const accepted = rule(state, silent);
            if (accepted && !silent) {
                const added = state.tokens
                    .slice(count)
                    .filter((token) => token.type === 'footnote_ref');
                if (added.length !== 1) {
                    throw new Error('Unexpected canonical footnote reference');
                }
                added[0].markup = state.src.slice(start, state.pos);
            }
            return accepted;
        };
        return after.call(inlineRuler, anchor, name, sourceRule, options);
    };
    try {
        // Capture generated HTML rules in an isolated table. The caller's table
        // and every own descriptor remain untouched, including accessors.
        Object.defineProperty(md.renderer, 'rules', {
            value: {},
            configurable: true,
            writable: true,
            enumerable: true,
        });
        Object.defineProperty(md.renderer, 'render', {
            value() {
                throw new Error('Source grammar capture must not render HTML');
            },
            configurable: true,
            writable: true,
        });
        footnotes(md, {
            generateID() {
                throw new Error('Source translation must not allocate HTML IDs');
            },
        });
    } finally {
        if (afterDescriptor) {
            Object.defineProperty(inlineRuler, 'after', afterDescriptor);
        } else {
            Reflect.deleteProperty(inlineRuler, 'after');
        }
        try {
            for (const [owner, key, descriptor] of [
                [md, 'parse', parseDescriptor],
                [md, 'parseInline', parseInlineDescriptor],
                [md.renderer, 'render', renderDescriptor],
            ] as const) {
                if (descriptor) {
                    Object.defineProperty(owner, key, descriptor);
                } else {
                    Reflect.deleteProperty(owner, key);
                }
            }
        } finally {
            if (rulesDescriptor) {
                Object.defineProperty(md.renderer, 'rules', rulesDescriptor);
            } else {
                Reflect.deleteProperty(md.renderer, 'rules');
            }
        }
    }
    if (references !== 1) {
        throw new Error('Expected one canonical footnote reference rule');
    }
    // Source consumers keep every definition at its original location, including
    // unused and duplicate definitions. They never execute HTML output ownership.
    md.core.ruler.disable(['footnote_tail', 'yfm_footnote_ownership']);

    const coreRuler = md.core.ruler;
    const coreAfter = coreRuler.after;
    const coreDescriptor = Object.getOwnPropertyDescriptor(coreRuler, 'after');
    let tasks = 0;
    coreRuler.after = (anchor, name, rule, options) => {
        if (name !== 'yfm_task_list') {
            throw new Error('Unexpected canonical task-list registration');
        }
        tasks++;
        const sourceRule: typeof rule = (state) => {
            const originals = new Map(
                state.tokens
                    .filter((token) => token.type === 'inline')
                    .map((token) => [token, token.children?.[0]?.content ?? '']),
            );
            rule(state);
            for (const [token, content] of originals) {
                const children = token.children;
                if (
                    children?.[0]?.type !== 'label_open' ||
                    children[1]?.type !== 'checkbox_input'
                ) {
                    continue;
                }
                const input = children[1];
                if (
                    input.attrGet('disabled') !== 'disabled' ||
                    children.at(-1)?.type !== 'label_close'
                ) {
                    throw new Error('Unexpected canonical disabled task shape');
                }
                const remaining = children[2]?.content ?? '';
                const removed = content.slice(0, content.length - remaining.length);
                if (!removed || content.slice(removed.length) !== remaining) {
                    throw new Error('Unexpected canonical task source prefix');
                }
                input.type = 'task_marker';
                input.markup = removed;
                input.content = '';
                children.splice(0, 1);
                children.pop();
            }
        };
        return coreAfter.call(coreRuler, anchor, name, sourceRule, options);
    };
    try {
        taskList(md);
    } finally {
        if (coreDescriptor) {
            Object.defineProperty(coreRuler, 'after', coreDescriptor);
        } else {
            Reflect.deleteProperty(coreRuler, 'after');
        }
    }
    if (tasks !== 1) {
        throw new Error('Expected one canonical task-list rule');
    }

    const activeEnvs: object[] = [];
    function scoped(parser: MarkdownIt['parse']): MarkdownIt['parse'] {
        return function (this: MarkdownIt, source, env = {}) {
            const previous = Object.getOwnPropertyDescriptor(env, 'footnotes');
            Object.defineProperty(env, 'footnotes', {
                value: {},
                configurable: true,
                writable: true,
                enumerable: true,
            });
            activeEnvs.push(env);
            try {
                return parser.call(this, source, env);
            } finally {
                activeEnvs.pop();
                if (previous) {
                    Object.defineProperty(env, 'footnotes', previous);
                } else {
                    Reflect.deleteProperty(env, 'footnotes');
                }
            }
        };
    }
    md.parse = scoped(parse);
    const isolatedInline = scoped(parseInline);
    md.parseInline = function (source, env = {}) {
        return (activeEnvs.at(-1) === env ? parseInline : isolatedInline).call(this, source, env);
    };
}
