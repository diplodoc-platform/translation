import {token} from 'src/utils';

import {dropUselessTokens, eruler, gobble} from './utils';
import {split} from './split';
import {CriticalProcessingError} from './error';

export {CriticalProcessingError};

const replace = (from: number, to: number, source: string, past: string) => {
    const start = source.slice(0, from);
    const end = source.slice(to);

    return start + past + end;
};

const last = <T>(array: T[], fallback: T): T => (array.length ? array[array.length - 1] : fallback);

function countStartIndexes(acc: number[], line: string) {
    acc.push(acc[acc.length - 1] + line.length + 1);

    return acc;
}

export type ConsumerOptions = {
    compact?: boolean;
    code?: CodeProcessing;
};

export enum CodeProcessing {
    NO = 'no',
    ALL = 'all',
    PRECISE = 'precise',
    ADAPTIVE = 'adaptive',
}

export class Consumer {
    gap = 0;

    lines: number[];

    compact: boolean;

    /**
     * Original content
     */
    readonly source: string;

    content: string;

    code: CodeProcessing | undefined;

    hash: (tokens: Token[]) => string;

    /**
     * Current window end.
     */
    get limit() {
        return last(this.limits, Infinity) + this.gap;
    }

    /**
     * Current window lines range mapped to sourcelines.
     */
    get range() {
        return {
            start: this.line(this.cursor - this.gap),
            end: this.line(this.limit - this.gap),
        };
    }

    /**
     * Current consumer position.
     * Also current window start.
     */
    private cursor = 0;

    private limits: number[] = [];

    constructor(content: string, options: ConsumerOptions, hash: (tokens: Token[]) => string) {
        this.lines = content.split('\n').reduce(countStartIndexes, [0]);
        this.compact = Boolean(options.compact);
        this.code = options.code;
        this.source = content;
        this.content = content;
        this.hash = hash;
    }

    process = (tokens: Token | Token[], window?: [number, number] | null) => {
        tokens = ([] as Token[]).concat(tokens);

        if (window) {
            this.setWindow(window);
        }

        const parts = split(tokens);

        const result = parts.map((part) => this.consume(part)).filter(Boolean) as {
            part: Token[];
            past: string;
        }[];

        if (window) {
            this.unsetWindow();
        }

        return result;
    };

    consume = (part: Token[], past?: string) => {
        let [before, tokens, after] = dropUselessTokens(part);

        if (!this.compact && tokens.length) {
            [before, tokens, after] = [[], part, []];
        }

        this.drop(before);

        if (tokens.length === 1) {
            // If single contentful token is something like liquid variable
            // then this token is useless for translation.
            if (tokens[0].type === 'liquid') {
                after = tokens.concat(after);
                tokens = [];
            } else if (tokens[0].type !== 'text') {
                tokens[0] = token('text', {
                    content: tokens[0].content,
                });
            }
        }

        if (tokens.length) {
            // erule has side effects and can modify tokens content
            // so we need to generate xliff only after original content replacement
            const [start, end] = this.erule(tokens);
            past = past || this.hash(tokens);

            this.content = replace(start, end, this.content, past);
            this.cursor = start + past.length;
            this.gap -= end - start - past.length;
        }

        this.drop(after);

        return past ? {part, past} : null;
    };

    private erule(tokens: Token[]) {
        try {
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
                },
            );
        } catch (error) {
            if (error instanceof CriticalProcessingError) {
                error.fill(this);
            }

            throw error;
        }
    }

    private drop(tokens: Token[]) {
        if (!tokens.length) {
            return;
        }

        const gap = this.gap;
        const cursor = this.cursor;
        const [start, end] = this.erule(tokens);

        tokens.forEach((token, i) => {
            if (token.beforeDrop) {
                token.beforeDrop(this, tokens[i - 1] || null, tokens[i + 1] || null);
            }
        });

        const dgap = gap - this.gap;

        this.cursor = start > -1 ? end - dgap : cursor - dgap;
    }

    private setWindow(map: [number, number] | null | undefined, gap?: number) {
        map = map || [0, this.lines.length - 1];
        gap = gap || this.gap;

        const [start, end] = [this.lines[map[0]] + gap, this.lines[map[1] + 1] || Infinity];

        this.limits.push(end);

        if (start >= this.cursor) {
            this.cursor = start;
        }
    }

    private unsetWindow() {
        this.limits.pop();
    }

    private line(pos: number) {
        let index = 0;
        let line = this.lines[index];
        while (pos > line && index < this.lines.length) {
            line = this.lines[++index];
        }
        return index;
    }
}
