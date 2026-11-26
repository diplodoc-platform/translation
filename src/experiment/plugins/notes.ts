import type {NoteParser, NoteState} from '@diplodoc/notes-extension/plugin';

import MarkdownIt from 'markdown-it';
import {createNotesPlugin} from '@diplodoc/notes-extension/plugin';

import {stringAttr} from 'src/utils';

type Token = MarkdownIt.Token;
const NativeToken = MarkdownIt.Token;

interface Boundary {
    token: Token;
    type: string;
    title: string;
}
interface SourceNotes {
    openings: Boundary[];
    closing: Token[];
    headers: string[];
}

// A lexical fallback only protects unsupported marker bytes; it does not decide
// whether the canonical grammar accepts them. Stop at the first unquoted end.
function opaqueMarker(fragment: string): string | undefined {
    const prefix = fragment.match(/^\{%\s*(?:note|endnote)(?=\s|%)/);
    if (!prefix) {
        return undefined;
    }
    let quoted = false;
    let slashes = 0;
    for (let i = prefix[0].length; i < fragment.length; i++) {
        const char = fragment[i];
        if (char === '\n' || char === '\r') {
            // Allow a softbreak immediately before a quoted title, but never
            // scan through a blank line or arbitrary following prose.
            const next = fragment.slice(i).match(/^\r?\n[ \t]*(?=")/);
            if (!quoted && next) {
                i += next[0].length - 1;
                continue;
            }
            break;
        }
        if (char === '"' && slashes % 2 === 0) {
            quoted = !quoted;
        }
        if (!quoted && char === '%' && fragment[i + 1] === '}') {
            return fragment.slice(0, i + 2);
        }
        slashes = char === '\\' ? slashes + 1 : 0;
    }
    // An incomplete lexical marker is kept opaque only to the line boundary;
    // it cannot consume an unrelated paragraph or next source line.
    const end = fragment.search(/[\r\n]/);
    return end < 0 ? fragment : fragment.slice(0, end);
}

/**
 * Install the canonical note grammar and translate its accepted source boundaries.
 * @param md - Translation's native MarkdownIt parser.
 * @returns Nothing; installs the finite source adapter.
 */
export function note(md: MarkdownIt.MarkdownIt) {
    let canonical: ((state: NoteState<Token>) => void) | undefined;
    const capture: NoteParser<Token> = {
        core: {
            ruler: {
                before(before, name, rule) {
                    if (before !== 'curly_attributes' || name !== 'notes' || canonical) {
                        throw new Error('Unexpected notes core rule registration');
                    }
                    canonical = rule;
                },
                push(name, rule) {
                    if (name !== 'notes' || canonical) {
                        throw new Error('Unexpected notes core rule registration');
                    }
                    canonical = rule;
                },
            },
        },
    };
    createNotesPlugin((path) => path)(capture, {notesAutotitle: false});
    if (!canonical) {
        throw new Error('Notes grammar did not register its core rule');
    }
    const applyCanonical = canonical;
    const contexts = new WeakMap<object, SourceNotes>();
    // Each public parse restores its caller's frame even when a nested parse
    // sharing the same environment throws and the caller catches the error.
    function withContext(parse: MarkdownIt.MarkdownIt['parse']): MarkdownIt.MarkdownIt['parse'] {
        return function (this: MarkdownIt.MarkdownIt, src, env) {
            const previous = contexts.get(env);
            try {
                return parse.call(this, src, env);
            } finally {
                if (previous) {
                    contexts.set(env, previous);
                } else {
                    contexts.delete(env);
                }
            }
        };
    }
    md.parse = withContext(md.parse);
    md.parseInline = withContext(md.parseInline);

    md.core.ruler.before('inline', 'note_source_capture', (state) => {
        // Canonical note parsing mutates maps: use a separate shadow forest.
        const shadow = state.tokens.map((token) => {
            const copy = Object.assign(
                new NativeToken(token.type, token.tag, token.nesting),
                token,
            );
            copy.map = token.map ? [...token.map] : null;
            copy.attrs = token.attrs?.map(([key, value]) => [key, value]) ?? null;
            return copy;
        });
        applyCanonical({
            tokens: shadow,
            env: {},
            Token: NativeToken,
            md: {
                parseInline(source) {
                    const token = new NativeToken('inline', '', 0);
                    token.content = source;
                    return [token];
                },
            },
        });
        const candidates = state.tokens.filter((token) => token.type === 'inline' && token.map);
        function sourceAt(line: number): Token {
            const matches = candidates.filter((token) => token.map?.[0] === line);
            if (matches.length !== 1) {
                throw new Error('Ambiguous canonical note source boundary');
            }
            return matches[0];
        }
        const result: SourceNotes = {openings: [], closing: [], headers: []};
        shadow.forEach((token, index) => {
            if (token.type === 'yfm_note_open' && token.map) {
                const type = stringAttr(token, 'note-type');
                if (!type) {
                    throw new Error('Canonical note has no type');
                }
                const title =
                    shadow[index + 1]?.type === 'yfm_note_title_open' &&
                    shadow[index + 2]?.type === 'inline'
                        ? shadow[index + 2].content
                        : '';
                const original = sourceAt(token.map[0]);
                result.openings.push({token: original, type, title});
                result.headers.push(original.content);
            }
            if (token.type === 'yfm_note_close' && token.map) {
                result.closing.push(sourceAt(token.map[0]));
            }
        });
        result.headers.sort((left, right) => right.length - left.length);
        contexts.set(state.env, result);
    });

    // Accepted full headers are supplied by the canonical block rule, not
    // guessed from the first delimiter encountered inside a quoted title.
    md.inline.ruler.before('backticks', 'note_marker', (state, silent) => {
        const fragment = state.src.slice(state.pos);
        const headers = contexts.get(state.env)?.headers ?? [];
        const accepted = headers.find((header) => fragment.startsWith(header));
        const fallback = opaqueMarker(fragment);
        const marker = accepted ?? fallback;
        if (!marker) {
            return false;
        }
        if (!silent) {
            const token = state.push('note_marker', '', 0);
            token.content = marker;
        }
        state.pos += marker.length;
        return true;
    });

    md.core.ruler.after('inline', 'note_source_adapter', (state) => {
        const source = contexts.get(state.env);
        if (!source) {
            return;
        }
        for (const token of source.closing) {
            const marker = token.children?.find((child) => child.type === 'note_marker');
            if (!marker) {
                throw new Error('Accepted note has no closing marker');
            }
            marker.type = 'note_close_tag';
        }
        for (const {token, type, title} of source.openings) {
            const marker = token.children?.find((child) => child.type === 'note_marker');
            if (!marker) {
                throw new Error('Accepted note has no source marker');
            }
            marker.type = 'note_open_tag';
            marker.children = [];
            const typeToken = new NativeToken('note_type', '', 0);
            typeToken.content = type;
            marker.children.push(typeToken);
            if (title) {
                const titleSpan = `"${title}"`;
                if (!marker.content.includes(titleSpan)) {
                    throw new Error('Canonical note title does not match the source marker');
                }
                const before = new NativeToken('note_quote_open', '', 0);
                before.content = '"';
                marker.children.push(before);
                md.inline.parse(title, md, state.env, marker.children);
                const after = new NativeToken('note_quote_close', '', 0);
                marker.children.push(after);
            }
        }
    });
}
