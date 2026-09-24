import {sentenize} from '@diplodoc/sentenizer';

import {token} from 'src/utils';
import {mtre} from 'src/symbols';

import {eruler, gobble, head, splitByContent, tail} from './utils';

const hasContent = (token: Token) => token.content || (token.markup && !token.skip);

const normalizePart = (tokens: Token[]) => {
    const stack: number[] = [];
    let linkContent = '';

    for (const [idx, token] of tokens.entries()) {
        if (token.type === 'link_open') {
            stack.push(idx);
            linkContent = '';
        }

        if (token.type === 'link_close') {
            stack.pop();
            linkContent = '';
        }

        if (stack.length > 0) {
            linkContent += token.content || '';
        }
    }

    if (!stack.length) {
        return {
            currentPart: tokens,
            nextPart: [],
        };
    }

    if (linkContent.includes('!')) {
        return {
            currentPart: tokens,
            nextPart: [],
        };
    }

    const lastIndex = stack[stack.length - 1];
    return {
        currentPart: tokens.slice(0, lastIndex),
        nextPart: tokens.slice(lastIndex),
    };
};

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
    // https://prostring.work/ru/char-block-info/40/type/12
    const someTypesSpaces = [
        8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287,
    ]
        .map((code) => String.fromCharCode(code))
        .join('');

    const trimEndRegExp = new RegExp(`[${someTypesSpaces} \t\r\n]+$`);
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

/** Stands in for a code span when asking the sentenizer, see `startsSentence`. */
const PROBE = 'XX';

/**
 * Text holding a sentence: a letter or a digit, not only punctuation after
 * a `{#T}` link, whose title is filled in at build time.
 */
const SENTENCE_TEXT = /[\p{L}\p{N}]/u;

/**
 * Tells whether an inline code span opening right after the content starts
 * a new sentence, in compact extraction only. Sentences are cut on the
 * text, where the span does not show its backticks, and an identifier in
 * code usually starts in lower case, which the sentenizer takes for the
 * same sentence going on:
 *
 * ```
 * Read-only mode persists. `yt-admin exit` command should be used.
 * ```
 *
 * A word in capitals in place of the span asks it whether a sentence would
 * start there. The sentenizer keeps an abbreviation of its dictionaries in
 * the sentence before a word in capitals (`e.g.`, `т. е.`, `etc.`, `см.`),
 * while before a capitalized word it splits after some of them: a code
 * span after an abbreviation is still the same sentence.
 */
function startsSentence(token: Token, content: string, nonSentenseCount: number, compact: boolean) {
    if (
        !compact ||
        token.type !== 'code_inline_open' ||
        !SENTENCE_TEXT.test(content.replaceAll('{#T}', ''))
    ) {
        return false;
    }

    const segments = sentenize(content + PROBE);

    return segments.length === nonSentenseCount + 2 && segments.at(-1)?.trim() === PROBE;
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
export function split(tokens: Token[], compact = false) {
    const parts: Token[][] = [];
    let content = '';
    let part: Token[] = [];
    let prevSegment = '';

    const add = (token: Token | null) =>
        token && (token.content || token.skip || token.markup) && part.push(token);
    const release = () => {
        if (part.length) {
            const {currentPart, nextPart} = normalizePart(part);
            parts.push(trim(currentPart));
            part = nextPart;

            if (nextPart.length > 0) {
                prevSegment = nextPart.map((token) => token.content).join('');
            } else {
                prevSegment = '';
            }

            content = '';
        }
    };

    let nonSentenseCount = 0;

    for (const _token of tokens) {
        if (startsSentence(_token, content, nonSentenseCount, compact)) {
            release();
            nonSentenseCount = 0;
        }

        if (hasContent(_token)) {
            content += _token.content || _token.markup || '';
        }

        if (_token.linebreak) {
            content += '\n';
        }

        const segments = sentenize(content);

        if (segments.length < 2 + nonSentenseCount) {
            add(_token);

            continue;
        }

        if (_token.isInlineCode) {
            add(_token);
            nonSentenseCount = segments.length - 1;

            continue;
        }

        // Here we have at minimum one full segment (head) and one incomplete (rest).
        // But we can have more that two, if last token consists big text sequence.

        const [head, full, rest] = [
            segments.splice(0, nonSentenseCount + 1),
            segments,
            segments.pop(),
        ];

        add(
            token('text', {
                content: exclude((prevSegment + head + '\n') as string, part).trimEnd(),
                generated: 'head',
            }),
        );
        release();

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
        nonSentenseCount = 0;
    }

    release();

    return parts;
}
