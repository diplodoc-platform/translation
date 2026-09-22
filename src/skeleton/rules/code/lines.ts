import {token} from 'src/utils';

/**
 * Half-open [from, to) range of translatable text inside a line.
 */
export type Range = [number, number];

const LETTER = /\p{L}/u;

export function hasLetters(text: string) {
    return LETTER.test(text);
}

/**
 * Lines of the code without trailing whitespace (and `\r`): it never carries
 * text and never gets into a skip, so the matching stays simple.
 */
export function lines(content: string) {
    return content.split('\n').map((line) => line.trimEnd());
}

/**
 * Turns a line of code into consumer tokens: every text range becomes a translatable
 * `text` token, and the code between the ranges becomes a verbatim `fake` token to skip.
 *
 * Skipping the exact bytes keeps the consumer cursor right before the text, so a label
 * that repeats an identifier earlier on the same line (`participant RPC as RPC`) never
 * replaces the identifier.
 *
 * Leading whitespace is never part of a skip token: markdown-it strips container
 * indentation from fenced code, so the token content and the source may differ there.
 */
export function* lineTokens(line: string, ranges: Range[]): Generator<Token> {
    let cursor = line.length - line.trimStart().length;

    for (const [from, to] of ranges) {
        if (from > cursor) {
            yield token('fake', {skip: line.slice(cursor, from)});
        }

        yield token('text', {content: line.slice(from, to)});

        cursor = to;
    }
}
