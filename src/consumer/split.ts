import {sentenize} from '@diplodoc/sentenizer';

import {token} from 'src/utils';
import {mtre} from 'src/symbols';

import {eruler, gobble, head, splitByContent, tail} from './utils';

const hasContent = (token: Token) => token.content || (token.markup && !token.skip);

// const normalizePart = (tokens: Token[]) => {
//     const stack: number[] = [];

//     for (const [idx, token] of tokens.entries()) {
//         if (idx !== 0 && token.type === 'link_open') {
//             stack.push(idx);
//         }

//         if (token.type === 'link_close') {
//             stack.pop();
//         }
//     }

//     if (!stack.length) {
//         return {
//             currentPart: tokens,
//             nextPart: [],
//         };
//     }

//     const nextPart: Token[] = [];

//     for (const idx of stack) {
//         nextPart.push(...tokens.splice(idx, 1));
//     }

//     return {
//         currentPart: tokens,
//         nextPart,
//     };
// };

export function trim(part: Token[]) {
    const [before, tokens, after] = splitByContent(part);

    if (!tokens.length) {
        return part;
    }

    const first = head(tokens) as Token;
    head(
        tokens,
        token(first.type, {
            ...first,
            content: first.content.trimStart(),
            generated: (first.generated || '') + '|trimStart',
        }),
    );

    const last = tail(tokens) as Token;
    const trimEndRegExp = /[ \t\r\n]+$/;
    tail(
        tokens,
        token(last.type, {
            ...last,
            content: last.content.replace(trimEndRegExp, ''),
            generated: (last.generated || '') + '|trimEnd',
        }),
    );

    return [...before, ...tokens, ...after];
}

function exclude(content: string, tokens: Token[]) {
    const part = trim(tokens.filter(hasContent));
    let from = 0,
        to = 0;

    eruler(content, [0, content.length], part, (...args) => {
        if (to < content.length) {
            [from, to] = gobble(...args);
        }

        return [from, to];
    });

    return content.slice(to);
}

/*
 * Split inline tokens sequence on parts,
 * where each part is equal to one sentense of inline fragment.
 * Trim useless spaces.
 *
 * Some **sentense**. Other sentense.
 * ^--------------------------------^ inline fragment
 * 1---1223------3445---------------5 tokens
 * ^----------------^ ^-------------^ sentenses
 *
 * So sentense one contains tokens from 1 to 4 and part of 5.
 * Sentense two contains only part of 5 token.
 */
// eslint-disable-next-line complexity
function isAutoTitleLink(tokens: Token[], token: Token, idx: number) {
    return (
        (token?.type === 'link_open' && tokens[idx + 1]?.reflink) ||
        (token?.type === 'link_close' && tokens[idx - 1]?.reflink)
    );
}

// eslint-disable-next-line complexity
export function split(tokens: Token[]) {
    const parts: Token[][] = [];
    let content = '';
    let part: Token[] = [];
    let isInsideLink = false;
    let linkTokens: Token[] = [];

    const add = (token: Token | null) =>
        token && (token.content || token.skip || token.markup) && part.push(token);

    const release = () => {
        if (part.length) {
            parts.push(trim(part));
            part = [];
            content = '';
        }
    };

    const releaseLink = () => {
        if (linkTokens.length) {
            parts.push(trim(linkTokens));
            linkTokens = [];
            content = '';
        }
    };

    for (const [idx, _token] of tokens.entries()) {
        const prevToken = tokens[idx - 1];

        if (
            _token.content === '.' &&
            prevToken.type === 'link_close' &&
            !isAutoTitleLink(tokens, prevToken, idx - 1)
        ) {
            const lastPart = parts[parts.length - 1];

            if (lastPart) {
                lastPart.push(_token);
            }

            continue;
        }

        if (_token.type === 'link_open' && !isAutoTitleLink(tokens, _token, idx)) {
            isInsideLink = true;
            linkTokens.push(_token);

            continue;
        }

        if (_token.type === 'link_close' && !isAutoTitleLink(tokens, _token, idx)) {
            isInsideLink = false;
            linkTokens.push(_token);
            release();
            releaseLink();
            continue;
        }

        if (isInsideLink) {
            linkTokens.push(_token);
            continue;
        }

        if (hasContent(_token)) {
            content += _token.content || _token.markup || '';
        }

        if (_token.linebreak) {
            content += '\n';
        }

        const segments = sentenize(content);

        if (segments.length < 2) {
            add(_token);
            continue;
        }

        const [head, full, rest] = [segments.shift(), segments, segments.pop()];

        if (
            head === '.' &&
            prevToken?.type === 'link_close' &&
            !isAutoTitleLink(tokens, prevToken, idx - 1)
        ) {
            const lastPart = parts[parts.length - 1];

            if (lastPart) {
                lastPart.push(
                    token('text', {
                        content: exclude((head + '\n') as string, part).trimEnd(),
                        generated: 'rest',
                    }),
                );
            }
        } else {
            add(
                token('text', {
                    content: exclude((head + '\n') as string, part).trimEnd(),
                    generated: 'head',
                }),
            );
            release();
        }

        for (const segment of full) {
            add(
                token('text', {
                    content: segment.trim(),
                    generated: 'leaf',
                }),
            );
            release();
        }

        content = (rest || '').replace(mtre, '');
        if (content) {
            add(
                token(_token.type, {
                    ..._token,
                    content: content.trim() ? content : _token.content,
                    generated: 'rest',
                }),
            );
        }
    }

    release();
    releaseLink();

    return parts;
}
