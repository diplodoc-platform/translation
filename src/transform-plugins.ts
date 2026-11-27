import type {MarkdownIt} from 'markdown-it';
import type {LogConsumer} from '@diplodoc/transform/log';

import {createDeprecationReporter} from '@diplodoc/transform/deprecation';
import {createNotesPlugin} from '@diplodoc/notes-extension/plugin';
import {bold} from 'chalk';
import {transform as createCut} from '@diplodoc/cut-extension';
import checkbox from '@diplodoc/transform/lib/plugins/checkbox';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import file from '@diplodoc/transform/lib/plugins/file';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';
import deflist from '@diplodoc/transform/lib/plugins/deflist';
import {visibility} from '@diplodoc/transform/lib/plugins/visibility';
import underline from '@diplodoc/transform/plugins/underline';
import subscript from '@diplodoc/transform/plugins/subscript';

export interface ExtractionDiagnostics {
    /** Location of source markup in diagnostics emitted by Transform plugins. */
    originalFile?: string;
    /** Report actual legacy markup through the caller's logger when supplied. */
    log?: LogConsumer;
    deprecationWarnings?: boolean;
}

/**
 * Scope warnings about authored markup to this extraction.
 * @param options - Source name, logger and deprecation policy from the caller.
 * @returns Options for the Transform plugins that recognize legacy markup.
 */
export function pluginDiagnostics(options: ExtractionDiagnostics) {
    const {originalFile, log, deprecationWarnings} = options;
    return {
        path: originalFile ?? '',
        deprecations: createDeprecationReporter({log, deprecationWarnings}),
    };
}

/** The complete options forwarded by the existing skeleton pipeline. */
export interface SkeletonPluginOptions {
    notesAutotitle: boolean;
    path: string;
}

type SkeletonPlugin = (md: MarkdownIt, options: SkeletonPluginOptions) => void;
type ExperimentPlugin = (
    md: MarkdownIt,
    ...options: [] | [ReturnType<typeof pluginDiagnostics>]
) => void;

const cut = createCut({bundle: false, directiveSyntax: 'disabled'});

function callable(value: unknown) {
    if (typeof value !== 'function') {
        throw new TypeError('Expected a callable Translation Transform plugin');
    }

    return value;
}

function skeletonPlugin(value: unknown): SkeletonPlugin {
    const plugin = callable(value);

    return (md, options) => {
        plugin(md, options);
    };
}

function experimentPlugin(value: unknown): ExperimentPlugin {
    const plugin = callable(value);

    return (md, ...options) => {
        plugin(md, ...options);
    };
}

// Preserve source bytes for Translation's source-position lookup, not HTML output.
function sourceSubscript(md: MarkdownIt, ...options: [] | [SkeletonPluginOptions]) {
    const ruler = md.inline.ruler;
    const after = ruler.after;
    const afterDescriptor = Object.getOwnPropertyDescriptor(ruler, 'after');
    let registered = false;

    // Capture only the new official rule through the native parser's typed public API.
    ruler.after = (target, name, rule, ruleOptions) => {
        if (registered || target !== 'emphasis' || name !== 'sub') {
            throw new Error('Expected one official subscript rule registration');
        }
        registered = true;
        const sourceRule: typeof rule = (state, silent) => {
            const start = state.pos;
            const tokenStart = state.tokens.length;
            const pending = state.pending;
            const accepted = rule(state, silent);
            if (accepted) {
                const created = state.tokens.slice(tokenStart);
                // Markdown-it push() first flushes an existing pending text token.
                const prefix = pending ? 1 : 0;
                const added = created.slice(prefix);
                if (
                    (prefix && (created[0].type !== 'text' || created[0].content !== pending)) ||
                    added.length !== 3 ||
                    added[0].type !== 'sub_open' ||
                    added[0].markup !== '~' ||
                    added[1].type !== 'text' ||
                    added[2].type !== 'sub_close' ||
                    added[2].markup !== '~' ||
                    state.src[start] !== '~' ||
                    state.src[state.pos - 1] !== '~'
                ) {
                    throw new Error('Expected the official subscript token shape');
                }
                added[1].content = state.src.slice(start + 1, state.pos - 1);
            }
            return accepted;
        };
        after.call(ruler, target, name, sourceRule, ruleOptions);
    };
    try {
        callable(subscript)(md, ...options);
    } finally {
        if (afterDescriptor) {
            Object.defineProperty(ruler, 'after', afterDescriptor);
        } else {
            Reflect.deleteProperty(ruler, 'after');
        }
    }
    if (!registered) {
        throw new Error('Expected an official subscript rule registration');
    }
}

/**
 * Markdown-it 15 boundary for the finite plugins exercised by Translation's runtime tests.
 * Callable validation alone does not establish parser compatibility. Keep this list
 * private to Translation until the plugins publish the native parser-compatible declarations.
 * @returns Skeleton registrations, preserving the parser and original options object.
 */
export function skeletonPlugins(): {
    visibility: SkeletonPlugin;
    notes: ReturnType<typeof createNotesPlugin>;
    cut: typeof cut;
    checkbox: SkeletonPlugin;
    monospace: SkeletonPlugin;
    imsize: SkeletonPlugin;
    file: SkeletonPlugin;
    video: SkeletonPlugin;
    table: SkeletonPlugin;
    underline: SkeletonPlugin;
    subscript: SkeletonPlugin;
} {
    return {
        visibility: skeletonPlugin(visibility({audience: 'preserve'})),
        notes: createNotesPlugin(bold),
        cut,
        checkbox: skeletonPlugin(checkbox),
        monospace: skeletonPlugin(monospace),
        imsize: skeletonPlugin(imsize),
        file: skeletonPlugin(file),
        video: skeletonPlugin(video),
        table: skeletonPlugin(table),
        underline: skeletonPlugin(underline),
        subscript: skeletonPlugin(sourceSubscript),
    };
}

/**
 * Retain the experiment's no-options registrations on its own parser.
 * @returns The finite foreign plugins used by the experiment.
 */
export function experimentPlugins() {
    return {
        deflist: experimentPlugin(deflist),
        imsize: experimentPlugin(imsize),
        table: experimentPlugin(table),
        underline: experimentPlugin(underline),
        subscript: experimentPlugin(sourceSubscript),
    };
}
