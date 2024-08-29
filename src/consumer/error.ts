import type {Consumer} from './index';

import {trim} from 'src/utils';

type Position = {start: number; end: number};

export class CriticalProcessingError extends Error {
    source: Position;

    content: string;

    match: string;

    get info() {
        const {
            source: {start, end},
            content,
            match,
        } = this;

        return trim`
          Target fragment:
          "\u001b[38;2;150;150;150m
            ${short(match)}
          \u001b[0m"  
          not found in lines range from line ${start} to ${end}:
          "\u001b[38;2;150;150;150m
            ${short(content)}
          \u001b[0m"    
        `;
    }

    constructor(source: Position, content: string, match: string) {
        super('Unable to extract valid tokens for text segment.');

        this.source = source;
        this.content = content;
        this.match = match;
    }

    fill(ctx: Consumer) {
        const {start, end} = (this.source = ctx.range);
        this.content = ctx.source.slice(ctx.lines[start], ctx.lines[end]);
        this.source = {start, end};
    }
}

function short(content: string) {
    const lines = content.split('\n');

    if (lines.length < 10) {
        return lines.join('\n');
    }

    return lines
        .slice(0, 5)
        .concat(`...(more ${lines.length - 5} lines)`)
        .join('\n');
}
