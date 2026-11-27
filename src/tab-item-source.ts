import type {Token} from 'markdown-it';
import type {TabSourceSpan, TabsItemSource} from '@diplodoc/tabs-extension';

import MarkdownIt from 'markdown-it';
import {transform as createCut} from '@diplodoc/cut-extension';
import {createNotesPlugin} from '@diplodoc/notes-extension/plugin';
import {transform as createTabs, recognizeTabsBoundary} from '@diplodoc/tabs-extension';

import {noTranslate} from 'src/directives';
import {skeletonPlugins} from 'src/transform-plugins';

type Span = [number, number];
type Projection = {raw: string; spans?: Span[]; reason?: string; line?: number};
type Options = {pipeline: 'skeleton' | 'experiment'; warnings: string[]};

function observe(source: string): TabsItemSource[] {
    const observations: TabsItemSource[] = [];
    const parser = new MarkdownIt({html: true})
        .use(noTranslate({mode: 'translate'}))
        .use(skeletonPlugins().visibility, {notesAutotitle: false, path: ''})
        .use(createCut({bundle: false, directiveSyntax: 'enabled', onDiagnostic() {}}))
        .use(createNotesPlugin(undefined, undefined, {directiveSyntax: 'enabled'}), {
            notesAutotitle: false,
        })
        .use(
            createTabs({
                bundle: false,
                directiveSyntax: 'enabled',
                onDiagnostic() {},
                onItemSource(snapshot) {
                    observations.push(snapshot);
                },
                features: {
                    enabledVariants: {regular: true, radio: true, dropdown: true, accordion: true},
                },
            }),
            {generateID: () => 'translation-item-observation'},
        );

    try {
        parser.parse(source, {});
        return observations;
    } catch {
        observations.length = 0;
        throw new Error('Tabs item source extraction refused: canonical parsing failed');
    }
}

function sameMap(left: Token['map'], right: TabSourceSpan | null) {
    return right && left?.[0] === right[0] && left[1] === right[1];
}

function union(source: Extract<TabsItemSource, {kind: 'ok'}>): Span[] | undefined {
    const ranges = Object.values(source.markers)
        .filter((span): span is TabSourceSpan => span !== null)
        .sort((left, right) => left[0] - right[0]);
    const spans: Span[] = [];

    for (const [start, end] of ranges) {
        if (
            !Number.isInteger(start) ||
            !Number.isInteger(end) ||
            start < 0 ||
            end <= start ||
            end > source.rawName.length
        ) {
            return undefined;
        }

        const previous = spans.at(-1);
        if (previous && start <= previous[1]) {
            previous[1] = Math.max(previous[1], end);
        } else {
            spans.push([start, end]);
        }
    }

    return spans;
}

function warn(warnings: string[], reason: string, line?: number) {
    const location = line === undefined ? '' : ` at normalized input line ${line + 1}`;
    const warning = `Tabs item source left untranslated (${reason})${location}.`;
    if (!warnings.includes(warning)) {
        warnings.push(warning);
    }
}

function associateTitle(
    inline: Token[],
    observation: TabsItemSource,
    projections: Map<Token, Projection>,
    warnings: string[],
) {
    const mapped = inline.filter((token) => sameMap(token.map, observation.inlineMap));
    const matches = mapped.filter((token) => token.content === observation.rawName);
    if (matches.length === 1) {
        const token = matches[0];
        const existing = projections.get(token);
        if (existing && !existing.spans) {
            return;
        }
        const spans = observation.kind === 'ok' ? union(observation) : undefined;
        const reason =
            observation.kind === 'unsupported' ? observation.reason : 'invalid-marker-span';
        projections.set(token, {
            raw: observation.rawName,
            spans,
            line: observation.inlineMap?.[0],
            ...(spans ? {} : {reason}),
        });
        return;
    }

    const {containerMap} = observation;
    if (!mapped.length && !containerMap) {
        throw new Error('Tabs item source extraction refused: source bounds are unavailable');
    }
    const candidates = mapped.length
        ? mapped
        : inline.filter((token) => within(token.map, containerMap));
    const reason =
        observation.kind === 'unsupported' ? observation.reason : 'ambiguous-source-title';
    warn(warnings, reason, observation.inlineMap?.[0] ?? containerMap?.[0]);
    for (const token of candidates) {
        projections.set(token, {raw: token.content, reason, line: token.map?.[0]});
    }
}

function within(map: Token['map'], bounds: TabSourceSpan | null) {
    return map && bounds && map[0] >= bounds[0] && map[1] <= bounds[1];
}

function trailingSpaces(text: string) {
    let start = text.length;
    while (start > 0 && (text[start - 1] === ' ' || text[start - 1] === '\t')) {
        start--;
    }
    return text.slice(start);
}

function preserveSpacing(
    output: Token[],
    raw: string,
    spans: WeakMap<Token, Span>,
    setMarkerContent: (token: Token, raw: string) => void,
) {
    for (const [index, child] of output.entries()) {
        const span = spans.get(child);
        if (!span) {
            continue;
        }
        const before = output[index - 1];
        const after = output[index + 1];
        const prefix = before?.type === 'text' ? trailingSpaces(before.content) : '';
        const suffix = after?.type === 'text' ? (/^[ \t]+/.exec(after.content)?.[0] ?? '') : '';
        const start = span[0] - prefix.length;
        const end = span[1] + suffix.length;
        if (raw.slice(start, span[0]) !== prefix || raw.slice(span[1], end) !== suffix) {
            return false;
        }

        // Keep only proven source-adjacent spaces out of skeleton's text trim.
        if (prefix) {
            before.content = before.content.slice(0, -prefix.length);
        }
        if (suffix) {
            after.content = after.content.slice(suffix.length);
        }
        setMarkerContent(child, raw.slice(start, end));
    }
    return true;
}

/**
 * Create source projection for canonical Tabs item markers on one Translation parser.
 * @param options - Pipeline token convention and recoverable warning receiver.
 * @returns A private accepted-header receiver and the source-only plugin installed last.
 */
export function createTabItemSource(options: Options) {
    const containers = new WeakSet<Token>();

    function plugin(md: MarkdownIt.MarkdownIt) {
        type Invocation = {
            projection: Projection;
            output: Token[];
            createMarker: () => Token;
            remaining: Set<Invocation>;
        };
        const pending = new WeakMap<Token[], Invocation>();
        const runs = new WeakMap<object, Set<Invocation>>();
        let active: {raw: string; spans: Span[]; consumed: Set<Span>} | undefined;
        const markerSpans = new WeakMap<Token, Span>();

        function content(token: Token, raw: string) {
            token.content = options.pipeline === 'experiment' ? raw : '';
            token.markup = raw;
            Object.assign(token, {skip: raw});
        }

        md.inline.ruler.before('text', 'translation_tab_item_marker', (state, silent) => {
            if (state.src !== active?.raw) {
                return false;
            }
            const span = active.spans.find(([start]) => start === state.pos);
            if (!span) {
                return false;
            }

            if (!silent) {
                const token = state.push('translation_directive_marker', '', 0);
                content(token, state.src.slice(span[0], span[1]));
                markerSpans.set(token, [...span]);
                active.consumed.add(span);
            }

            state.pos = span[1];
            return true;
        });

        md.core.ruler.before('inline', 'translation_tab_item_association', (state) => {
            const needed = state.tokens.some((token, index) => {
                if (containers.has(token)) {
                    return true;
                }
                const boundary = recognizeTabsBoundary(state.tokens, index);
                return boundary?.kind === 'open' || boundary?.kind === 'unsupported';
            });
            if (!needed) {
                return;
            }

            const projections = new Map<Token, Projection>();
            const inline = state.tokens.filter((token) => token.type === 'inline');
            for (const observation of observe(state.src)) {
                associateTitle(inline, observation, projections, options.warnings);
            }

            const remaining = new Set<Invocation>();
            const outputs = new Set<Token[]>();
            for (const [token, projection] of projections) {
                if (projection.spans?.length === 0) {
                    continue;
                }
                const output = token.children;
                if (!output || output.length || outputs.has(output)) {
                    throw new Error(
                        'Tabs item source extraction refused: inline output identity is ambiguous',
                    );
                }
                outputs.add(output);
                const invocation: Invocation = {
                    projection,
                    output,
                    createMarker: () => new state.Token('translation_directive_marker', '', 0),
                    remaining,
                };
                remaining.add(invocation);
                pending.set(output, invocation);
            }
            runs.set(state, remaining);
        });

        md.core.ruler.after('inline', 'translation_tab_item_source', (state) => {
            const remaining = runs.get(state);
            runs.delete(state);
            if (!remaining?.size) {
                return;
            }
            for (const invocation of remaining) {
                pending.delete(invocation.output);
            }
            throw new Error('Tabs item source extraction refused: inline output identity changed');
        });

        const parse = md.inline.parse;
        const descriptor = Object.getOwnPropertyDescriptor(md.inline, 'parse');
        const projectedParse: typeof parse = function (
            this: typeof md.inline,
            source,
            parser,
            env,
            output,
        ) {
            const invocation = pending.get(output);
            pending.delete(output);
            invocation?.remaining.delete(invocation);
            const previous = active;
            const projection = invocation?.projection;
            const context = projection?.spans
                ? {raw: projection.raw, spans: projection.spans, consumed: new Set<Span>()}
                : undefined;
            active = context;

            function opaque(reason: string) {
                if (!invocation || !projection) {
                    return;
                }
                const marker = invocation.createMarker();
                content(marker, projection.raw);
                output.splice(0, output.length, marker);
                warn(options.warnings, reason, projection.line);
            }

            try {
                parse.call(this, source, parser, env, output);
                if (!projection) {
                    return;
                }
                if (!projection.spans) {
                    opaque(projection.reason ?? 'unsupported-source-title');
                    return;
                }
                if (source !== projection.raw) {
                    opaque('source-title-changed');
                    return;
                }
                if (!projection.spans.every((span) => context?.consumed.has(span))) {
                    opaque('atomic-inline-marker');
                    return;
                }

                if (!preserveSpacing(output, projection.raw, markerSpans, content)) {
                    opaque('ambiguous-source-spacing');
                }
            } finally {
                active = previous;
            }
        };
        Object.defineProperty(md.inline, 'parse', {
            value: projectedParse,
            configurable: descriptor?.configurable ?? true,
            enumerable: descriptor?.enumerable ?? true,
            writable: descriptor && 'writable' in descriptor ? descriptor.writable : true,
        });
    }

    return {
        acceptContainer(token: Token) {
            containers.add(token);
        },
        plugin,
    };
}
