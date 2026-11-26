import type {StateBlock, Token} from 'markdown-it';
import type {ContainerDirectiveParams} from '@diplodoc/directive';

import MarkdownIt from 'markdown-it';
import {
    directiveParser,
    registerContainerDirective,
    tokenizeBlockContent,
} from '@diplodoc/directive';
import {transform as createCut} from '@diplodoc/cut-extension';
import {createNotesPlugin} from '@diplodoc/notes-extension/plugin';
import {transform as createTabs} from '@diplodoc/tabs-extension';

import {noTranslate} from 'src/directives';

const families = ['cut', 'note', 'tabs'] as const;
type Family = (typeof families)[number];
type Header = {raw: string; title?: {raw: string; start: number; end: number}};
type ProjectionOptions = {
    pipeline: 'skeleton' | 'experiment';
    onTabsContainer?: (token: Token) => void;
};

/**
 * Ask the real owner whether this complete block is accepted, without rendering.
 * @param family - Owner of the outermost source block.
 * @param source - Complete source slice supplied by the Directive parser.
 * @returns Whether the owner produced its public opening token at the root.
 */
function accepts(family: Family, source: string): boolean {
    const parser = new MarkdownIt({html: true})
        .use(noTranslate({mode: 'translate'}))
        .use(createCut({bundle: false, directiveSyntax: 'enabled'}))
        .use(createNotesPlugin(undefined, undefined, {directiveSyntax: 'enabled'}), {
            notesAutotitle: false,
        })
        .use(
            createTabs({
                bundle: false,
                directiveSyntax: 'enabled',
                features: {
                    enabledVariants: {regular: true, radio: true, dropdown: true, accordion: true},
                },
            }),
            {generateID: () => 'translation-observation'},
        );
    const opening = {cut: 'yfm_cut_open', note: 'yfm_note_open', tabs: 'tabs_open'};

    const tokens = parser.parse(source, {});
    if (
        tokens[0]?.type !== opening[family] &&
        !(family === 'tabs' && tokens[0]?.type === 'dropdown_open')
    ) {
        return false;
    }
    let depth = 0;
    for (const [index, token] of tokens.entries()) {
        depth += token.nesting;
        if (depth === 0) {
            return index === tokens.length - 1;
        }
    }
    return false;
}

/**
 * Project canonical colon containers into source tokens for either extraction pipeline.
 * @param md - The actual native parser used by Translation.
 * @param options - Source token convention of the owning pipeline.
 * @returns Nothing; keeps HTML callbacks off the source parser.
 */
export function sourceBlockDirectives(md: MarkdownIt.MarkdownIt, options: ProjectionOptions) {
    const headers = new WeakMap<Token, Header>();
    md.use(directiveParser());

    function header(
        state: StateBlock,
        line: number,
        title?: ContainerDirectiveParams['inlineContent'],
    ) {
        const start = state.bMarks[line] + state.tShift[line];
        const raw = state.src.slice(start, state.eMarks[line]);
        const open = state.push('paragraph_open', 'p', 1);
        open.map = [line, line + 1];
        const token = state.push('translation_directive_header', '', 0);
        token.content = raw;
        token.map = [line, line + 1];
        headers.set(token, {
            raw,
            ...(title
                ? {
                      title: {
                          raw: title.raw,
                          start: title.startPos - start,
                          end: title.endPos - start,
                      },
                  }
                : {}),
        });
        state.push('paragraph_close', 'p', -1);
        return token;
    }

    for (const family of families) {
        registerContainerDirective(
            md,
            family,
            (state: StateBlock, params) => {
                const source = state.getLines(
                    params.startLine,
                    params.endLine,
                    state.blkIndent,
                    false,
                );
                const accepted = accepts(family, source);
                const token = header(
                    state,
                    params.startLine,
                    accepted && family !== 'tabs' ? params.inlineContent : undefined,
                );
                if (accepted && family === 'tabs') {
                    options.onTabsContainer?.(token);
                }
                tokenizeBlockContent(state, params.content, 'translation-block-directive');
                return true;
            },
            {onConflict: 'error'},
        );
    }

    // A refusal prefix protects syntax bytes; it does not recognize parameters or closures.
    md.block.ruler.after(
        'block_directive',
        'translation_directive_refusal',
        (state, line, _end, silent) => {
            const start = state.bMarks[line] + state.tShift[line];
            const raw = state.src.slice(start, state.eMarks[line]);
            if (!/^:{3,}(?:[ \t]*(?:cut|note|tabs)(?=[\s[({]|$)|[ \t]*$)/i.test(raw)) {
                return false;
            }
            if (!silent) {
                header(state, line);
                state.line = line + 1;
            }
            return true;
        },
    );

    md.core.ruler.after('inline', 'translation_directive_source', (state) => {
        function marker(raw: string): Token {
            const token = new state.Token('translation_directive_marker', '', 0);
            token.content = options.pipeline === 'experiment' ? raw : '';
            token.markup = raw;
            Object.assign(token, {skip: raw});
            return token;
        }

        for (const token of state.tokens) {
            const saved = headers.get(token);
            if (!saved) {
                continue;
            }
            token.type = 'inline';
            token.children = [];
            if (!saved.title) {
                token.children.push(marker(saved.raw));
                continue;
            }
            const {raw, title} = saved;
            if (raw.slice(title.start, title.end) !== title.raw) {
                throw new Error('Canonical directive title does not match its source span');
            }
            token.children.push(marker(raw.slice(0, title.start)));
            md.inline.parse(title.raw, md, state.env, token.children);
            token.children.push(marker(raw.slice(title.end)));
        }
    });
}

/**
 * Preserve the source accepted by the existing no-translate inline handler in V2.
 * @param md - Fresh native parser owned by the experimental pipeline.
 * @returns Nothing; preserves the original inline rule registration descriptor.
 */
export function sourceNoTranslate(md: MarkdownIt.MarkdownIt) {
    const ruler = md.inline.ruler;
    const push = ruler.push;
    const descriptor = Object.getOwnPropertyDescriptor(ruler, 'push');
    let captured = 0;
    const capture: typeof push = (name, rule, options) => {
        if (name !== 'inline_directive') {
            return push.call(ruler, name, rule, options);
        }
        captured++;
        const sourceRule: typeof rule = (state, silent) => {
            const start = state.pos;
            const count = state.tokens.length;
            const accepted = rule(state, silent);
            if (accepted && !silent) {
                for (const token of state.tokens.slice(count)) {
                    if (token.type !== 'no_translate_inline') {
                        continue;
                    }
                    token.type = 'no_translate_marker';
                    token.nesting = 0;
                    token.content = state.src.slice(start, state.pos);
                }
            }
            return accepted;
        };
        return push.call(ruler, name, sourceRule, options);
    };
    try {
        Object.defineProperty(ruler, 'push', {
            value: capture,
            configurable: true,
            writable: true,
            enumerable: true,
        });
        md.use(noTranslate({mode: 'translate'}));
    } finally {
        if (descriptor) {
            Object.defineProperty(ruler, 'push', descriptor);
        } else {
            Reflect.deleteProperty(ruler, 'push');
        }
    }
    if (captured !== 1) {
        throw new Error('Expected one canonical inline directive rule');
    }
}
