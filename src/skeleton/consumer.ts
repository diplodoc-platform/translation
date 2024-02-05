import type {SkeletonRendererState} from 'src/skeleton/renderer';
import {ok} from 'assert';
import {sentenize} from '@diplodoc/sentenizer';
import {XLF, XLFRenderState} from 'src/xlf';
import {token} from 'src/utils';

type NonEmptyString = '${.*}';

const hasContent = (token: Token) => token.content;
const notFake = (token: Token) => !token.fake;
const br = (token: Token) => ['hardbreak', 'softbreak'].includes(token.type);
const reflink = (token: Token) => token.reflink;
const replace = (from: number, to: number, source: string, past: string) => {
    const start = source.slice(0, from);
    const end = source.slice(to);

    return start + past + end;
};
const isContentful = (token: Token) => !reflink(token) && token.content?.trim();
const firstContentful = (tokens: Token[]): [null | Token, number] => {
    const index = tokens.findIndex(isContentful);

    return index > -1 ? [tokens[index], index] : [null, -1];
};
const lastContentful = (tokens: Token[]): [null | Token, number] => {
    const index = tokens.findLastIndex(isContentful);

    return index > -1 ? [tokens[index], index] : [null, -1];
};

function dropUselessTokens(tokens: Token[]) {
    const [, first] = firstContentful(tokens);
    const [, last] = lastContentful(tokens);

    if (first === -1) {
        return [tokens, [], []];
    }

    return [tokens.slice(0, first), tokens.slice(first, last + 1), tokens.slice(last + 1)];
}

type Gobbler<O = any, I = string | Token | (string | Token)[]> = (content: string, window: [number, number], token: I) => O;

type SearchRule = (content: string, from: number, match: string) => [number, number, string];

function eruler(content: string, [start, end]: [number, number], tokens: (string | Token)[],  action: Gobbler) {
    return tokens.reduce(([from, to], token) => {
        if (!token || typeof token === 'object' && !token.content && !token.skip) {
            return [from, to];
        }

        const [_from, _to] = action(content, [to, end], token);

        // assert?

        return [from === -1 ? _from : from, _to];
    }, [-1, start]);
}

const searchCommon: SearchRule = (content, from, match) => {
    const index = content.indexOf(match, from);

    return [index, index + match.length, match];
};

const searchTrimStart: SearchRule = (content, from, match) => {
    while (match.startsWith(' ')) {
        match = match.slice(1);

        const index = content.indexOf(match, from);

        if (index > -1) {
            return [index, index + match.length, match];
        }
    }

    return [-1, -1, ''];
};

const searchRegExp: SearchRule = (content, from, match) => {
    const variant = match.replace(/\\\\/g, '\\');
    const index = content.indexOf(variant, from);

    return [index, index + variant.length, variant];
};

const searchLinkText: SearchRule = (content, from, match) => {
    const variant = match.replace(/(\[|])/g, '\\$1');
    const index = content.indexOf(variant, from);

    return [index, index + variant.length, variant];
};

const searchMultilineInlineCode: SearchRule = (content, from, match) => {
    const parts = match.split(/[\s\n]/g);

    let index;
    const start = (index = content.indexOf(parts.shift() as string, from));
    while (parts.length && index > -1) {
        const part = parts.shift() as string;
        index = content.indexOf(part, index);
        index = index === -1 ? index : index + part.length;
    }

    if (index === -1) {
        return [-1, -1, match];
    }

    return [start, index, content.slice(start, index)];
};

const search: Gobbler<[number, number, string], NonEmptyString> =
    (content, [start, end], match) => {
        const matches = [searchCommon, searchTrimStart, searchRegExp, searchLinkText, searchMultilineInlineCode];

        ok(match, `search aaaaaaaa empty ${match}`);

        let from = -1, to = -1, variant = match;
        while (matches.length && from === -1) {
            start = start === -1 ? 0 : start;
            [from, to, variant] = (matches.shift() as SearchRule)(content, start, match);
            // console.log(`
            //     SEARCH: |${match}|
            //     WHERE:  |${content.slice(start, end)}|
            //     RESULT: |${from > -1 ? '-'.repeat(from - start) + '^' : from}|
            // `);
        }

        ok(from >= start, `search aaaaaaaa start: ${from} > ${start}`);
        ok(to <= end, `search aaaaaaaa end: ${to} <= ${end}`);

        return [from, to, variant];
    };

const skip: Gobbler<[number, number]> =
    (content, [start, end], token) => {
        let from = start === -1 ? 0 : start;
        let to;

        if (Array.isArray(token)) {
            [from, to] = eruler(content, [from, end], token, skip);
        } else if (token.skip) {
            [from, to] = skip(content, [from, end], token.skip);
            if (token.onskip) {
                token.onskip(content, from, to);
            }
        } else {
            const match = typeof token === 'string' ? token : token.content;

            [from, to] = match
                ? search(content, [start, end], match as NonEmptyString)
                : [from, from];
        }

        ok(to <= end, `skip aaaaaaaa end: ${to} <= ${end}`);

        return [from, to];
    };

const gobble: Gobbler<[number, number] | [number, number, string], Token> =
    (content, [start, end], token) => {
        if (token.skip) {
            return skip(content, [start, end], token);
        } else if (token.content) {
            return search(content, [start, end], token.content as NonEmptyString);
        }

        return [-1, -1];
    };

function trim(part: Token[]) {
    const [first, iFirst] = firstContentful(part);
    if (first) {
        part[iFirst] = token(first.type, {
            ...first,
            content: first.content.trimStart(),
            generated: (first.generated || '') + '|trimStart',
        });
    }

    const [last, iLast] = lastContentful(part);
    if (last) {
        part[iLast] = token(last.type, {
            ...last,
            content: last.content.trimEnd(),
            generated: (last.generated || '') + '|trimEnd'
        });
    }

    return part;
}

function exclude(content: string, tokens: Token[]) {
    const part = trim(tokens.filter(hasContent));
    const [, to] = eruler(content, [0, content.length], part, gobble);

    return content.slice(to);
}

export class Consumer {
    gap = 0;

    limit = Infinity;

    private xlfState: XLFRenderState;

    constructor(
        public content: string,
        public cursor: number,
        public state: SkeletonRendererState,
    ) {
        this.xlfState = XLF.state(this.state);
    }

    token(type: string, props: Record<string, any> = {}) {
        return token(type, props);
    }

    skip(part: string | null | undefined | (Token | string)[]) {
        if (part) {
            const [from, to] = skip(this.content, [this.cursor, this.limit], part);

            if (from > -1) {
                this.cursor = to;
            }
        }

        return this;
    }

    split(tokens: Token[]) {
        const parts: Token[][] = [];
        let content = '';
        let part: Token[] = [];

        const add = (token: Token | null) => token && (token.content || token.skip) && part.push(token);
        const release = () => {
            if (part.length) {
                parts.push(trim(part.filter(notFake)));
                part = [];
                content = '';
            }
        };

        for (const token of tokens) {
            let fake: Token | null = null;
            if (!hasContent(token)) {
                part.push(token);

                if (br(token)) {
                    content += ' ';
                    fake = this.token('text', {
                        content: ' ',
                        fake: true,
                        generated: 'fake',
                    });
                } else if (token.markup && !token.skip) {
                    content += token.markup;
                    fake = this.token('text', {
                        content: token.markup,
                        fake: true,
                        generated: 'fake',
                    });
                } else {
                    continue;
                }
            }

            content += token.content || '';

            const segments = sentenize(content);

            // console.log('segments', segments);

            if (segments.length === 1) {
                add(fake);
                add(token);

                continue;
            }

            const [head, full, rest] = [segments.shift(), segments, segments.pop()];

            add(this.token('text', {
                content: exclude(head, part).trimEnd(),
                generated: 'head',
            }));
            release();

            for (const segment of full) {
                add(this.token('text', {
                    content: segment.trim(),
                    generated: 'leaf',
                }));
                release();
            }

            content = (fake?.content || '') + rest;
            add(fake)
            add(this.token(token.type, {
                ...token,
                content: rest,
                generated: 'rest',
            }));
        }

        release();

        return parts;
    }

    window(map: [number, number] | null, gap: number) {
        map = map || [1, this.state.lines.end.length];

        const [start, end] = [
            this.state.lines.start[map[0] - 1] + gap,
            this.state.lines.end[map[1] - 1] + gap,
        ];

        if (start >= this.cursor) {
            this.cursor = start;
            this.limit = end;
        }
    }

    process = (tokens: Token | Token[]): {part: Token[]; past: string}[] => {
        tokens = ([] as Token[]).concat(tokens);

        const parts = this.split(tokens);

        return parts.map(this.consume).filter(Boolean);
    };

    consume = (part: Token[]) => {
        let past;
        const [before, tokens, after] = dropUselessTokens(part);
        // console.log({before, tokens, after})

        this.handleHooks('before', before);
        this.skip(before);
        this.handleHooks('after', before);

        if (tokens.length === 1 && tokens[0].type !== 'text') {
            tokens[0] = this.token('text', {
                content: tokens[0].content,
            });
        }

        if (tokens.length) {
            past = `%%%${this.state.skeleton.id}%%%`;

            // replace has side effects and can modify tokens content
            // so we need to generate xlf only after original content replacement
            this.replace(tokens, past);

            const inline = this.token('inline', {
                children: tokens,
            });

            const xlf = XLF.render([inline], this.xlfState, {
                unitId: this.state.skeleton.id++,
                lang: 'ru',
            });

            this.state.segments.push(xlf);
        }

        this.handleHooks('before', after);
        this.skip(after);
        this.handleHooks('after', after);

        return past ? {part, past} : null;
    };

    replace(tokens: Token[], past: string) {
        // console.log(tokens);
        if (!tokens.length) {
            return;
        }

        const [start, end] = eruler(
            this.content,
            [this.cursor, this.limit],
            tokens,
            (content, [start, end], token) => {
                const [from, to, match] = gobble(content, [start, end], token);

                if (match) {
                    token.content = match;
                }

                return [from, to];
            });

        const gap = -(end - start - past.length);
        this.content = replace(start, end, this.content, past);
        this.cursor = start + past.length;
        this.limit += gap;
        this.gap += gap;
    }

    handleHooks(phase: 'before' | 'after', tokens: Token | Token[]) {
        tokens = ([] as Token[]).concat(tokens);

        tokens.forEach((token: Token) => {
            const handlers = this.state.hooks[phase].get(token);
            handlers.forEach((handler) => handler(this));
        });
    }
}
