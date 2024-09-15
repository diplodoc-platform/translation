import {sentenize} from '@diplodoc/sentenizer';
import {capitalize, uniq} from 'lodash';
import Token from 'markdown-it/lib/token';

import {TokenExtraMap} from '../types';

import {getExtraToken, toJsonF} from './common';

export function applySegmentation(
    mdData: string,
    inlineToken: Token,
    tokenExtraMap: TokenExtraMap,
) {
    const extraToken = getExtraToken(tokenExtraMap, inlineToken);
    let rawInline = mdData.slice(extraToken.start, extraToken.end);

    let splitPoints: number[] = [];

    let level = 0;
    const inlineOffset = extraToken.start;
    inlineToken.children?.forEach((token) => {
        const {start, end} = getExtraToken(tokenExtraMap, token);
        const typeM = /^.+_(open|close)$/.exec(token.type);
        if (typeM) {
            const [, state] = typeM;
            if (state === 'open') {
                level++;
            } else {
                level--;
            }
        }
        if (token.type !== 'text' || level !== 0) {
            const len = end - start;
            const variable = 'a'.repeat(len);
            rawInline =
                rawInline.slice(0, start - inlineOffset) +
                capitalize(variable) +
                rawInline.slice(end - inlineOffset);
            if (level === 0 && token.type === 'html_inline' && /^<br\s*\/?>$/.test(token.content)) {
                splitPoints.push(end);
            }
        }
    });

    rawInline = rawInline.replace(/\n/g, ' ');

    const sentences = sentenize(rawInline);
    if (sentences.length === 1 && !splitPoints.length) {
        return [inlineToken];
    }

    let lastPos = 0;
    sentences.forEach((sentence) => {
        const pos = rawInline.indexOf(sentence, lastPos);
        if (pos === -1) {
            throw new Error('Sentence not found');
        }
        const [spaces = ''] = /^\s+/.exec(sentence) || [];
        if (spaces && spaces.length !== sentence.length) {
            splitPoints.push(inlineOffset + pos + spaces.length);
        }
        const end = pos + sentence.length;
        splitPoints.push(inlineOffset + end);
        lastPos = end;
    });

    splitPoints = uniq(splitPoints).sort((a, b) => (a > b ? 1 : -1));

    let lastInlineToken = inlineToken;
    const inlineTokens: Token[] = [];
    for (let i = 0, len = splitPoints.length; i < len; i++) {
        const point = splitPoints[i];
        const [leftToken, rightToken] = splitInlineToken(
            mdData,
            lastInlineToken,
            point,
            tokenExtraMap,
        );
        lastInlineToken = rightToken;
        inlineTokens.push(leftToken);
    }

    inlineTokens.forEach((token, index) => {
        token.attrSet('idPostfix', `_s-${index + 1}`);
    });

    return inlineTokens;
}

export function trimInlineToken(mdData: string, inlineToken: Token, tokenExtraMap: TokenExtraMap) {
    const result = [];
    let children;
    let remainingPart = inlineToken;

    const inheritPostfix = function (newToken: Token, prevToken: Token) {
        const idPostfix = prevToken.attrGet('idPostfix');
        if (idPostfix) {
            newToken.attrSet('idPostfix', idPostfix);
        }
    };

    const canTrimToken = (token: Token) => {
        return ['html_inline', 'attr_anchor', 'softbreak', 'liquid_operator'].includes(token.type);
    };

    children = (remainingPart.children ?? []).slice(0);
    let leftPoint: number | undefined;
    for (let i = 0, len = children.length; i < len; i++) {
        const token = children[i];
        if (canTrimToken(token)) {
            const extraToken = getExtraToken(tokenExtraMap, token);
            leftPoint = extraToken.end;
        } else {
            if (token.type === 'text' && leftPoint) {
                const offset = token.content.length - token.content.trimStart().length;
                if (offset > 0) {
                    leftPoint += offset;
                }
            }
            break;
        }
    }
    if (leftPoint) {
        const [leftInlineToken, rightInlineToken] = splitInlineToken(
            mdData,
            remainingPart,
            leftPoint,
            tokenExtraMap,
        );
        if (leftInlineToken.content.length) {
            result.push(leftInlineToken);
        }
        inheritPostfix(rightInlineToken, inlineToken);
        remainingPart = rightInlineToken;
    }

    children = (remainingPart.children ?? []).slice(0);
    let rightPoint: number | undefined;
    for (let i = children.length - 1; i >= 0; i--) {
        const token = children[i];
        if (canTrimToken(token)) {
            const extraToken = getExtraToken(tokenExtraMap, token);
            rightPoint = extraToken.start;
        } else {
            if (token.type === 'text' && rightPoint) {
                const offset = token.content.length - token.content.trimEnd().length;
                if (offset > 0) {
                    rightPoint -= offset;
                }
            }
            break;
        }
    }
    if (rightPoint) {
        const [leftInlineToken, rightInlineToken] = splitInlineToken(
            mdData,
            remainingPart,
            rightPoint,
            tokenExtraMap,
        );
        if (leftInlineToken.content.length) {
            inheritPostfix(leftInlineToken, remainingPart);
            result.push(leftInlineToken);
        }
        remainingPart = rightInlineToken;
    }

    if (remainingPart.content.length) {
        result.push(remainingPart);
    }

    return result;
}

export function splitInlineToken(
    mdData: string,
    inlineToken: Token,
    point: number,
    tokenExtraMap: TokenExtraMap,
) {
    const inlineTokenExtra = getExtraToken(tokenExtraMap, inlineToken);

    const leftChildren: Token[] = [];
    const children = (inlineToken.children ?? []).slice(0);
    while (children.length) {
        const token = children.shift();
        if (!token) {
            throw new Error('Token is empty');
        }
        const {start, end, level} = getExtraToken(tokenExtraMap, token);

        if (start >= point) {
            children.unshift(token);
            break;
        }

        if (end <= point) {
            leftChildren.push(token);
            continue;
        }

        if (pointInRange(point, start, end)) {
            if (token.type !== 'text') {
                throw new Error("Can't split non text token");
            }

            const leftToken = new Token('text', '', 0);
            leftToken.content = mdData.slice(start, point);
            tokenExtraMap.set(leftToken, {
                start,
                end: point,
                level,
            });
            leftChildren.push(leftToken);

            const rightToken = new Token('text', '', 0);
            rightToken.content = mdData.slice(point, end);
            tokenExtraMap.set(rightToken, {
                start: point,
                end,
                level,
            });
            children.unshift(rightToken);

            break;
        } else {
            // eslint-disable-next-line no-console
            console.error(
                'Unexpected case',
                toJsonF({
                    token,
                    start,
                    end,
                    point,
                }),
            );
            throw new Error('Unexpected case');
        }
    }

    const leftInlineToken = new Token('inline', '', 0);
    leftInlineToken.content = mdData.slice(inlineTokenExtra.start, point);
    leftInlineToken.children = leftChildren;
    tokenExtraMap.set(leftInlineToken, {
        start: inlineTokenExtra.start,
        end: point,
        level: inlineTokenExtra.level,
    });

    const rightInlineToken = new Token('inline', '', 0);
    rightInlineToken.content = mdData.slice(point, inlineTokenExtra.end);
    rightInlineToken.children = children;
    tokenExtraMap.set(rightInlineToken, {
        start: point,
        end: inlineTokenExtra.end,
        level: inlineTokenExtra.level,
    });

    return [leftInlineToken, rightInlineToken];
}

function pointInRange(point: number, from: number, to: number) {
    return point >= from && point < to;
}
