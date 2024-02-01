import type {SkeletonRendererState} from 'src/skeleton/renderer';
import {ok} from 'assert';
import {sentenize} from '@diplodoc/sentenizer';
import MdIt from 'markdown-it';
import {XLF, XLFRenderState} from 'src/xlf';

const md = new MdIt();
const state = new md.core.State('', md, {});
const hasContent = (token: Token) => token.content?.trim();
const br = (token: Token) => token.type === 'softbreak';
const reflink = (token: Token) => token.reflink;
const replace = (from: number, to: number, source: string, past: string) => {
    const start = source.slice(0, from);
    const end = source.slice(to);

    return start + past + end;
};

const first = <T>(array: T[]): T => {
    return array[0];
};
const last = <T>(array: T[]): T => {
    return array[array.length - 1];
};

function dropUselessTokens(tokens: Token[]) {
    const before: Token[] = [];
    const after: Token[] = [];

    tokens = tokens.slice();

    const isUseless = (token: Token) =>
        ['anchor'].includes(token.type) || reflink(token) || br(token) || !hasContent(token);

    while (tokens.length && isUseless(first(tokens))) {
        before.push(tokens.shift() as Token);
    }

    while (tokens.length && isUseless(last(tokens))) {
        after.unshift(tokens.pop() as Token);
    }

    return [before, tokens, after];
}

function normalize(token: Token) {
    if (!token.content) {
        return '';
    }

    if (token.type === 'html_inline') {
        return ' ';
    }

    return token.content;
}

function search(where: string, token: Token, from: number): [string, number] {
    let index = where.indexOf(token.content, from);

    // console.log(`
    //     SEARCH: ${token.content}
    //     WHERE:  ${where.slice(from, from + token.content.length + 10)}
    //     RESULT: ${index > -1 ? '-'.repeat(index - from) + '^' : index}
    // `);

    // for regexps
    if (index === -1) {
        const content = token.content
            .replace(/\\\\/g, '\\');

        index = where.indexOf(content, from);

        if (index > -1) {
            token.content = content;
            return [content, index];
        }
    }

    // for link text
    if (index === -1) {
        const content = token.content
            .replace(/(\[|\])/g, '\\$1');

        index = where.indexOf(content, from);

        if (index > -1) {
            token.content = content;
            return [content, index];
        }
    }

    // for multiline inline code
    if (index === -1) {
        const parts = token.content.split(/ |\n/g);

        const start = index = where.indexOf(parts.shift(), from);
        while (parts.length && index > -1) {
            const part = parts.shift();
            index = where.indexOf(part, index);
            index = index === -1 ? index : index + part.length;
        }

        if (index > -1) {
            token.content = where.slice(start, index);
            return [token.content, start];
        }
    }

    return [token.content, index];
}

export class Consumer {
    private xlfState: XLFRenderState;

    gap = 0;

    limit = Infinity;

    constructor(
        public content: string,
        public cursor: number,
        public state: SkeletonRendererState,
    ) {
        this.xlfState = XLF.state(this.state);
    }

    token(type: string, props: Record<string, any> = {}) {
        return Object.assign(new state.Token(type, '', 0), props);
    }

    skip(part: string | null | undefined | Token[]) {
        if (Array.isArray(part)) {
            part.forEach((token) => this.skip((token.skip || '') as string));
        }

        if (!part) {
            return this;
        }

        const index = this.content.indexOf(part as string, this.cursor);
        if (index > -1) {
            this.cursor = index + part.length;
        }

        return this;
    }

    split(tokens: Token[]) {
        const parts = [];
        let content = '';
        let part = [];

        for (const token of tokens) {
            if (hasContent(token)) {
                const segments = sentenize(content + normalize(token));

                if (segments.length > 1) {
                    segments.shift();

                    const restT = this.token(token.type, {
                        content: token.content,
                        markup: token.markup,
                        tag: token.tag,
                        generated: 'rest',
                    });

                    while (segments.length) {
                        const firstT = this.token('text', {
                            generated: 'leaf',
                        });

                        const segment = segments.shift();

                        firstT.content = restT.content
                            .split(segment)
                            .slice(0, -1)
                            .join(segment)
                            .trimEnd();

                        restT.content = restT.content.replace(firstT.content, '').trimStart();

                        part.push(firstT);
                        parts.push(part);

                        part = [];
                    }

                    if (restT.content) {
                        part.push(restT);
                    }

                    content = restT.content;
                } else {
                    part.push(token);
                    content += normalize(token);
                }
            } else if (br(token)) {
                content += ' ';
                part.push(token);
            } else {
                part.push(token);
            }
        }

        if (part.length) {
            parts.push(part);
        }

        return parts;
    }

    window(map: [number, number] | null, gap: number) {
        map = map || [0, this.state.lines.end.length - 1];

        const offset = this.state.lines.start[map[0]] + gap;
        if (offset > this.cursor) {
            this.cursor = offset;
            this.limit = this.state.lines.end[map[1]] + gap;
        }
    }

    process = (tokens: Token | Token[]): [Token[][], string[]] => {
        tokens = ([] as Token[]).concat(tokens);

        const parts = this.split(tokens);
        const pasts = parts.map(this.consume);

        return [parts, pasts];
    };

    consume = (part: Token[]) => {
        const [before, tokens, after] = dropUselessTokens(part);

        this.handleHooks('before', before);
        this.skip(before);
        this.handleHooks('after', before);

        if (tokens.length === 1 && tokens[0].type !== 'text') {
            tokens[0] = this.token('text', {
                content: tokens[0].content,
            });
        }

        const past = `%%%${this.state.skeleton.id}%%%`;

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

        this.handleHooks('before', after);
        this.skip(after);
        this.handleHooks('after', after);

        return past;
    };

    replace(tokens: Token[], past: string) {
        if (!tokens.length) {
            return;
        }

        const {start, end} = tokens.reduce(
            ({start, end}, token: Token) => {
                if (token.skip) {
                    ({start, end} = token.skip.reduce(
                        ({start, end}, skip) => {
                            const index = this.content.indexOf(skip, end);

                            return {
                                start: start === -1 ? index : start,
                                end: index + skip.length,
                            };
                        },
                        {start, end},
                    ));
                } else if (token.content) {
                    const [content, index] = search(this.content, token, end);

                    if (index < 0) {
                        // console.log(this.content);
                        console.log(token);
                        console.log(this.content.slice(end, end + 50));
                        // console.log(end, this.content.length);
                    }

                    ok(index >= 0, 'aaaaaaaa');

                    start = start === -1 ? index : start;
                    end = index + content.length;
                }

                return {start, end};
            },
            {start: -1, end: this.cursor},
        );

        this.content = replace(start, end, this.content, past);
        this.cursor = start + past.length;
        this.gap += -(end - start - past.length);
    }

    handleHooks(phase: 'before' | 'after', tokens: Token | Token[]) {
        tokens = ([] as Token[]).concat(tokens);

        tokens.forEach((token: Token) => {
            const handlers = this.state.hooks[phase].get(token);
            handlers.forEach((handler) => handler(this));
        });
    }
}
