import type {Gobbler, NonEmptyString} from 'src/skeleton/types';
import {ok} from 'node:assert';
import {search} from 'src/consumer/search';

export function eruler<T extends string | Token>(content: string, [start, end]: [number, number], tokens: T[],  action: Gobbler<T>) {
    return tokens.reduce(([from, to], token, i) => {
        if (!token || typeof token === 'object' && !token.content && !token.skip && !token.markup) {
            return [from, to];
        }

        const [_from, _to] = action(content, [to, end], token, i);

        // assert?

        return [from === -1 ? _from : from, _to];
    }, [-1, start]);
}

export const skip: Gobbler =
    (content, [start, end], token, i) => {
        let from = start === -1 ? 0 : start;
        let to;

        if (Array.isArray(token)) {
            [from, to] = eruler(content, [from, end], token, skip);
        } else if ((token as Token).skip) {
            // @ts-ignore
            [from, to] = skip(content, [from, end], (token as Token).skip, i);
        } else {
            const match = typeof token === 'string' ? token : (token.content || token.markup);

            [from, to] = match
                ? search(content, [start, end], match as NonEmptyString, i)
                : [from, from];
        }

        ok(to <= end, `skip aaaaaaaa end: ${to} <= ${end}`);

        return [from, to];
    };

export const gobble: Gobbler<Token> =
    (content, [start, end], token, i) => {
        if (token.skip || token.markup) {
            return skip(content, [start, end], token, i);
        } else if (token.content) {
            return search(content, [start, end], token.content as NonEmptyString, i);
        }

        return [-1, -1];
    };

const reflink = (token: Token) => token.reflink;
const isContentful = (token: Token) => !reflink(token) && token.content?.trim();

export const firstContentful = (tokens: Token[]): [null | Token, number] => {
    const index = tokens.findIndex(isContentful);

    return index > -1 ? [tokens[index], index] : [null, -1];
};
export const lastContentful = (tokens: Token[]): [null | Token, number] => {
    // @ts-ignore
    const index = tokens.findLastIndex(isContentful);

    return index > -1 ? [tokens[index], index] : [null, -1];
};

export function dropUselessTokens(tokens: Token[]) {
    const [, first] = firstContentful(tokens);
    const [, last] = lastContentful(tokens);

    if (first === -1) {
        return [tokens, [], []];
    }

    return [tokens.slice(0, first), tokens.slice(first, last + 1), tokens.slice(last + 1)];
}