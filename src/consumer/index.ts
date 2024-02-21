import {token} from 'src/utils';
import {dropUselessTokens, eruler, gobble} from './utils';
import {split} from './split';

const replace = (from: number, to: number, source: string, past: string) => {
    const start = source.slice(0, from);
    const end = source.slice(to);

    return start + past + end;
};

function countStartIndexes(acc: number[], line: string) {
    acc.push(acc[acc.length - 1] + line.length + 1);

    return acc;
}

export class Consumer {
    gap = 0;

    limit = Infinity;

    lines: number[];

    constructor(
        public content: string,
        public cursor: number,
        readonly hash: (tokens: Token[]) => string
    ) {
        this.lines = content.split('\n').reduce(countStartIndexes, [0]);
    }

    process = (tokens: Token | Token[], window?: [number, number] | null) => {
        tokens = ([] as Token[]).concat(tokens);

        if (window) {
            this.setWindow(window);
        }

        const parts = split(tokens);

        return parts
            .map((part) => this.consume(part))
            .filter(Boolean) as {part: Token[]; past: string}[];
    };

    consume = (part: Token[], past?: string) => {
        const [before, tokens, after] = dropUselessTokens(part);
        // console.log({before, tokens, after})

        if (before.length) {
            this.drop(before);
            const [start, end] = this.erule(before);
            this.cursor = start > -1 ? end : this.cursor;
        }

        if (tokens.length === 1 && tokens[0].type !== 'text') {
            tokens[0] = token('text', {
                content: tokens[0].content,
            });
        }

        if (tokens.length) {
            // erule has side effects and can modify tokens content
            // so we need to generate xliff only after original content replacement
            const [start, end] = this.erule(tokens);
            past = past || this.hash(tokens);

            this.content = replace(start, end, this.content, past);
            this.cursor = start + past.length;
            this.limit -= end - start - past.length;
            this.gap -= end - start - past.length;
        }

        if (after.length) {
            this.drop(after);
            const [start, end] = this.erule(after);
            this.cursor = start > -1 ? end : this.cursor;
        }

        return past ? {part, past} : null;
    };

    private erule(tokens: Token[]) {
        return eruler(
            this.content,
            [this.cursor, this.limit],
            tokens,
            (content, [start, end], token, i) => {
                const [from, to, match] = gobble(content, [start, end], token, i);

                token.map = [from, to];

                if (match) {
                    token.content = match;
                }

                if (token.erule) {
                    token.erule(this, tokens, i, [from, to]);
                }

                return [from, to];
            });
    }

    private drop(tokens: Token[]) {
        tokens.forEach((token, i) => {
            if (token.beforeDrop) {
                token.beforeDrop(this, tokens[i - 1] || null, tokens[i + 1] || null);
            }
        })
    }

    private setWindow(map: [number, number] | null | undefined, gap?: number) {
        map = map || [0, this.lines.length - 1];
        gap = gap || this.gap;

        const [start, end] = [
            this.lines[map[0]] + gap,
            this.lines[map[1]] + gap,
        ];

        if (start >= this.cursor) {
            this.cursor = start;
        }

        if (end >= this.limit) {
            this.limit = end;
        }
    }
}
