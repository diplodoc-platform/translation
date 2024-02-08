import type {Gobbler, NonEmptyString} from './types';
import type { SkeletonRendererState } from '.';
import {ok} from 'assert';
import {sentenize} from '@diplodoc/sentenizer';
import {XLF} from 'src/xliff';
import {token} from 'src/utils';
import {search} from './search';

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

function eruler<T extends string | Token>(content: string, [start, end]: [number, number], tokens: T[],  action: Gobbler<T>) {
    return tokens.reduce(([from, to], token) => {
        if (!token || typeof token === 'object' && !token.content && !token.skip) {
            return [from, to];
        }

        const [_from, _to] = action(content, [to, end], token);

        // assert?

        return [from === -1 ? _from : from, _to];
    }, [-1, start]);
}

const skip: Gobbler =
    (content, [start, end], token) => {
        let from = start === -1 ? 0 : start;
        let to;

        if (Array.isArray(token)) {
            [from, to] = eruler(content, [from, end], token, skip);
        } else if ((token as Token).skip) {
            // @ts-ignore
            [from, to] = skip(content, [from, end], (token as Token).skip);
        } else {
            const match = typeof token === 'string' ? token : token.content;

            [from, to] = match
                ? search(content, [start, end], match as NonEmptyString)
                : [from, from];
        }

        ok(to <= end, `skip aaaaaaaa end: ${to} <= ${end}`);

        return [from, to];
    };

const gobble: Gobbler<Token> =
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

    constructor(
        public content: string,
        public cursor: number,
        public state: SkeletonRendererState,
    ) {}

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

    window(map: [number, number] | null | undefined, gap: number) {
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

    process = (tokens: Token | Token[]) => {
        tokens = ([] as Token[]).concat(tokens);

        const parts = this.split(tokens);

        return parts.map(this.consume).filter(Boolean) as {part: Token[]; past: string}[];
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
            // so we need to generate xliff only after original content replacement
            this.replace(tokens, past);

            const xliff = XLF.render(tokens, this.state, {
                unitId: this.state.skeleton.id++,
                lang: 'ru',
            });

            this.state.segments.push(xliff);
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

    /**
     * Split inline tokens sequence on parts,
     * where each part is equal to one sentense of inline fragment.
     * Trim useless spaces.
     *
     * Some **sentense**. Other sentense.
     * ^--------------------------------^ inline fragment
     * ^-1-^ 2^--3---^ 4^5^------6------^ tokens
     * ^----------------^ ^-------------^ parts
     */
    private split(tokens: Token[]) {
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

                    // there was tokens which markup we will skip manually.
                    // for all other we need to skip it here with help of fake text token.
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

            // Here we have at minimum one full segment (head) and one incomplete (rest).
            // But we can have more that two, if last token consists big text sequence.

            const [head, full, rest] = [segments.shift(), segments, segments.pop()];

            add(this.token('text', {
                content: exclude(head as string, part).trimEnd(),
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

    private handleHooks(phase: 'before' | 'after', tokens: Token | Token[]) {
        tokens = ([] as Token[]).concat(tokens);

        tokens.forEach((token: Token) => {
            const handlers = this.state.hooks[phase].get(token);
            handlers.forEach((handler) => handler(this));
        });
    }
}
