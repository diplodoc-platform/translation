import type {Gobbler, NonEmptyString} from 'src/skeleton/types';

import {search} from 'src/consumer/search';
import {mtre} from 'src/symbols';

export function eruler<T extends string | Token>(
    content: string,
    [start, end]: [number, number],
    tokens: T[],
    action: Gobbler<T>,
) {
    return tokens.reduce(
        ([from, to], token, i) => {
            if (
                !token ||
                (typeof token === 'object' && !token.content && !token.skip && !token.markup)
            ) {
                return [from, to];
            }

            const [_from, _to] = action(content, [to, end], token, i);

            // assert?

            return [from === -1 ? _from : from, _to];
        },
        [-1, start],
    );
}

export const skip: Gobbler = (content, [start, end], token, i) => {
    let from = start === -1 ? 0 : start;
    let to;

    if (Array.isArray(token)) {
        [from, to] = eruler(content, [from, end], token, skip);
    } else if ((token as Token).skip) {
        // @ts-ignore
        [from, to] = skip(content, [from, end], (token as Token).skip, i);
    } else {
        const match = typeof token === 'string' ? token : token.content || token.markup;

        [from, to] = match
            ? search(content, [start, end], match as NonEmptyString, i)
            : [from, from];
    }

    return [from, to];
};

export const gobble: Gobbler<Token> = (content, [start, end], token, i) => {
    if (token.skip || token.markup) {
        return skip(content, [start, end], token, i);
    } else if (token.content) {
        return search(content, [start, end], token.content as NonEmptyString, i);
    }

    return [-1, -1];
};

function isContentful(token: Token) {
    return Boolean(token.content.replace(mtre, '')?.trim());
}

function isTranslatable(token: Token) {
    return Boolean(isContentful(token) && token.type !== 'liquid');
}

export function dropUselessTokens(tokens: Token[], accurate = false) {
    if (accurate) {
        const grouped = groupUselessTokens(tokens);

        if (grouped) {
            return splitByContent(grouped, isTranslatable);
        }
    }

    return splitByContent(tokens, isTranslatable);
}

type TokenGroup = {
    role: string;
    type: string;
    child: (Token | TokenGroup)[];
    parent?: TokenGroup;
    closed: boolean;
};

export function head(tokens: (TokenGroup | Token)[], value?: TokenGroup | Token) {
    if (value) {
        tokens[0] = value;
    }

    return tokens[0];
}

export function tail(tokens: (TokenGroup | Token)[], value?: TokenGroup | Token) {
    if (value) {
        tokens[tokens.length - 1] = value;
    }

    return tokens[tokens.length - 1];
}

function matchGroup(token: Token) {
    const match = /(.*?)_(open|close)/.exec(token.type);

    return match
        ? {
              type: match[1],
              kind: match[2],
          }
        : null;
}

function isGroup(token: Token | TokenGroup): token is TokenGroup {
    return 'role' in token && token.role === 'group';
}

function groupUselessTokens(tokens: Token[]): (Token | TokenGroup)[] | null {
    const tree = {role: 'group', type: 'root', child: [], closed: true};

    let group: TokenGroup = tree;
    for (const token of tokens) {
        const match = matchGroup(token);
        if (match) {
            if (match.kind === 'open') {
                group.child.push(
                    (group = {
                        role: 'group',
                        type: match.type,
                        child: [token],
                        parent: group,
                        closed: false,
                    }),
                );
            } else if (group.type === match.type) {
                group.child.push(token);
                group.closed = true;
                group = group.parent as TokenGroup;
            } else {
                return null;
            }
        } else {
            group.child.push(token);
        }
    }

    if (!group.closed) {
        while (group && group.parent) {
            const parent = group.parent;

            // remove opened group from parent
            parent.child.pop();
            // push opened group content directly to parent
            parent.child.push(...group.child);

            group = parent;
        }
    }

    return tree.child;
}

export function splitByContent(grouped: (Token | TokenGroup)[], hasContent = isContentful) {
    const before: Token[] = [];
    const content: Token[] = [];
    const after: Token[] = [];

    grouped = grouped.slice();

    let contentful = false;
    let action = shift;
    // shift -> pop -> end
    while (action) {
        action = action();
    }

    return contentful ? [before, content, after] : [before.concat(content), [], after];

    // consumes all useless tokens before content
    function shift() {
        const token = head(grouped);
        if (!token || isGroup(token) || isContentful(token)) {
            return pop;
        }

        before.push(grouped.shift() as Token);

        return shift;
    }

    // consumes all useless tokens after content
    function pop() {
        const token = tail(grouped);
        if (!token || isGroup(token) || isContentful(token)) {
            return end;
        }

        after.unshift(grouped.pop() as Token);

        return pop;
    }

    // ungroup grouped content
    // counts if content is really useful
    function end() {
        const token = grouped.shift();
        if (!token) {
            return;
        }

        if (isGroup(token)) {
            grouped.unshift(...token.child);

            return end;
        }

        if (hasContent(token)) {
            contentful = true;
        }

        content.push(token as Token);

        return end;
    }
}
