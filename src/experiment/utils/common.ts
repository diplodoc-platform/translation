import type MarkdownIt from 'markdown-it';
import markdownit from 'markdown-it';
import Token from 'markdown-it/lib/token';

import {passTranslation} from '../constants';
import {liquidOperator} from '../plugins/liquid/liquidOperator';
import {xliffSpecial} from '../plugins/xliffSpecial';
import {childrenTokenSearch} from '../tokenSearch';
import {TokenExtraMap} from '../types';

/* eslint-disable no-console */

const mdFence = markdownit().use(liquidOperator).use(xliffSpecial);
mdFence.inline.ruler.enableOnly(['liquidOperator', 'xliffSpecial']);

export function toJson(data: unknown, format = false) {
    return JSON.stringify(data, null, format ? 2 : undefined);
}

export function toJsonF(data: unknown) {
    return toJson(data, true);
}

export function getExtraToken(tokenExtraMap: TokenExtraMap, token: Token) {
    const extraToken = tokenExtraMap.get(token);
    if (!extraToken) {
        throw new Error('Token extra not found');
    }
    return extraToken;
}

// fix memory leak
export function safeSlice(str: string, start?: number, end?: number) {
    return Buffer.from(str.slice(start, end)).toString();
}

export function getTokenChildrenPos(tokenExtraMap: TokenExtraMap, children: Token[]) {
    // const extraToken = getExtraToken();
    const firstToken = children[0];
    const lastToken = children[children.length - 1];
    const {start} = getExtraToken(tokenExtraMap, firstToken);
    const {end} = getExtraToken(tokenExtraMap, lastToken);
    return {start, end};
}

export function floatToken(mdData: string, tokenExtraMap: TokenExtraMap, token: Token) {
    const name = token.type;
    const children = token.children;
    if (!children?.length) {
        throw new Error('Children not found');
    }

    const {start: pStart, end: pEnd, level} = getExtraToken(tokenExtraMap, token);
    const {start: cStart, end: cEnd} = getTokenChildrenPos(tokenExtraMap, children);

    const openToken = new Token(`${name}_open`, '', 0);
    openToken.content = mdData.slice(0, cStart);
    tokenExtraMap.set(openToken, {
        start: pStart,
        end: cStart,
        level,
    });

    const closeToken = new Token(`${name}_close`, '', 0);
    closeToken.content = mdData.slice(cEnd);
    tokenExtraMap.set(closeToken, {
        start: cEnd,
        end: pEnd,
        level,
    });

    children.forEach((tokenLocal) => {
        const extraToken = getExtraToken(tokenExtraMap, tokenLocal);
        extraToken.level -= 1;
    });

    return [openToken, ...children, closeToken];
}

export function hasTextChildren(token: Token): boolean {
    if (!token.children) return false;
    return token.children.some((tokenLocal) => {
        if (tokenLocal.type === 'text') {
            return true;
        }
        return hasTextChildren(tokenLocal);
    });
}

export function someTokens(
    tokens: Token[],
    check: (token: Token, index: number, tokens: Token[]) => boolean,
): boolean {
    return tokens.some((token, index, arr) => {
        let found = check(token, index, arr);
        if (!found && token.children) {
            found = someTokens(token.children, check);
        }
        return found;
    });
}

export function eachTokens(
    tokens: Token[],
    check: (token: Token, index: number, tokens: Token[]) => unknown | true,
) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const skipChildren = check(token, i, tokens) === true;
        if (!skipChildren && token.children) {
            eachTokens(token.children, check);
        }
    }
}

export function printMap(mdData: string, allTokens: Token[], tokenExtraMap: TokenExtraMap) {
    eachTokens(allTokens, (token) => {
        const {level, end, start, yamlToken} = getExtraToken(tokenExtraMap, token);
        console.log(`${'  '.repeat(level)}${token.type}:`, toJson(mdData.slice(start, end)));
        if (yamlToken) {
            printMap(yamlToken.content, yamlToken.children || [], tokenExtraMap);
            return true;
        }
        return false;
    });
}

export function tabReplace(dataArg: string, tokenExtraMap: TokenExtraMap) {
    let data = dataArg;

    let offsetAcc = 0;
    const offsetReplaceList: {pos: number; offPos: number; text: string; delta: number}[] = [];
    data = data.replace(/\t/g, (text, pos) => {
        const newText = '    ';
        const delta = newText.length - text.length;
        offsetReplaceList.push({pos, offPos: offsetAcc + pos, text, delta});
        offsetAcc += delta;
        return newText;
    });

    const revert = (dataArgLocal: string) => {
        let dataLocal = dataArgLocal;

        tokenExtraMap.forEach((extraToken) => {
            const {start, end} = extraToken;
            let offset = 0;
            let textOffset = 0;
            offsetReplaceList.forEach(({offPos, delta}) => {
                if (offPos < start) {
                    offset -= delta;
                }
                if (offPos >= start && offPos < end) {
                    textOffset -= delta;
                }
            });
            // eslint-disable-next-line no-param-reassign
            extraToken.start += offset;
            // eslint-disable-next-line no-param-reassign
            extraToken.end += offset + textOffset;
        });
        offsetReplaceList.forEach(({pos, text, delta}) => {
            dataLocal = dataLocal.slice(0, pos) + text + dataLocal.slice(pos + text.length + delta);
        });

        return dataLocal;
    };
    return {data, revert};
}

export function variableReplace(dataArg: string) {
    let data = dataArg;

    const variableReplaceList: {pos: number; text: string}[] = [];
    data = data.replace(/\{\{.+?}}/g, (text, pos) => {
        variableReplaceList.push({pos, text});
        return `{{${'a'.repeat(text.length - 4)}}}`;
    });

    const revert = (dataArgLocal: string) => {
        let dataLocal = dataArgLocal;
        variableReplaceList.forEach(({pos, text}) => {
            dataLocal = dataLocal.slice(0, pos) + text + dataLocal.slice(pos + text.length);
        });
        return dataLocal;
    };
    return {data, revert};
}

export function extractLinkTitle(
    md: MarkdownIt,
    mdData: string,
    tokenExtraMap: TokenExtraMap,
    token: Token,
    tokens: Token[],
) {
    const extraToken = getExtraToken(tokenExtraMap, token);
    const {start, end, level} = extraToken;
    const {titleStart: titleStartRel, titleEnd: titleEndRel} = token.meta;
    const titleStart = titleStartRel + start;
    const titleEnd = titleEndRel + start;

    const linkTitleToken = new Token('link_title', '', 0);
    linkTitleToken.content = mdData.slice(start, titleStart);
    tokenExtraMap.set(linkTitleToken, {
        start: start,
        end: titleEnd + 1,
        level,
    });
    linkTitleToken.children = [];

    const raw = mdData.slice(titleStart, titleEnd);
    md.inline.parse(raw, md, null, linkTitleToken.children);
    const levelTokenType: string[] = [];
    childrenTokenSearch(
        mdData,
        tokenExtraMap,
        linkTitleToken.children,
        levelTokenType,
        titleStart,
        level + 1,
    );

    const idx = tokens.indexOf(token);
    if (idx === -1) {
        throw new Error('Token not found');
    }
    tokens.splice(idx, 0, linkTitleToken);

    // eslint-disable-next-line no-param-reassign
    token.content = mdData.slice(titleEnd + 1, end);
    extraToken.start = titleEnd + 1;
}

export function extractImageTitle(
    md: MarkdownIt,
    mdData: string,
    tokenExtraMap: TokenExtraMap,
    token: Token,
    tokens: Token[],
) {
    const imageTokens = floatToken(mdData, tokenExtraMap, token);
    const imageCloseToken = imageTokens.pop();
    if (!imageCloseToken) {
        throw new Error('imageCloseToken not found');
    }

    const extraToken = getExtraToken(tokenExtraMap, imageCloseToken);
    const {start, end, level} = extraToken;
    const {titleStart: titleStartRel, titleEnd: titleEndRel} = token.meta;
    const titleStart = titleStartRel + start;
    const titleEnd = titleEndRel + start;

    const imageTitleToken = new Token('image_title', '', 0);
    imageTitleToken.content = mdData.slice(start, titleStart);
    tokenExtraMap.set(imageTitleToken, {
        start: start,
        end: titleEnd + 1,
        level,
    });
    imageTitleToken.children = [];

    const raw = mdData.slice(titleStart, titleEnd);
    md.inline.parse(raw, md, null, imageTitleToken.children);
    const levelTokenType: string[] = [];
    childrenTokenSearch(
        mdData,
        tokenExtraMap,
        imageTitleToken.children,
        levelTokenType,
        titleStart,
        level + 1,
    );

    imageTokens.push(imageTitleToken, imageCloseToken);

    const idx = tokens.indexOf(token);
    if (idx === -1) {
        throw new Error('Token not found');
    }
    tokens.splice(idx, 1, ...imageTokens);

    // eslint-disable-next-line no-param-reassign
    imageCloseToken.content = mdData.slice(titleEnd + 1, end);
    extraToken.start = titleEnd + 1;
}

export function extractInlineCode(mdData: string, tokenExtraMap: TokenExtraMap, token: Token) {
    const extraToken = getExtraToken(tokenExtraMap, token);
    const {start, end, level} = extraToken;

    const markupLen = token.markup.length;
    const codeStart = start + markupLen;
    const codeEnd = end - markupLen;

    const raw = mdData.slice(codeStart, codeEnd);

    if (passTranslation.test(raw)) return;

    // eslint-disable-next-line no-param-reassign
    token.children = [];

    mdFence.inline.parse(raw, mdFence, null, token.children);
    const levelTokenType: string[] = [];
    childrenTokenSearch(
        mdData,
        tokenExtraMap,
        token.children,
        levelTokenType,
        codeStart,
        level + 2,
    );
}

export function extractFenceLines(mdData: string, tokenExtraMap: TokenExtraMap, token: Token) {
    const extraToken = getExtraToken(tokenExtraMap, token);
    const {start, end, level, linePosList = []} = extraToken;
    const raw = mdData.slice(start, end);

    // eslint-disable-next-line no-param-reassign
    token.children = [];

    let offset = start;

    const rawLines = raw.split('\n');
    const lines = token.content.split('\n');

    if (token.type === 'fence') {
        const fenceBegin = rawLines.shift() || '';
        if (!fenceBegin.endsWith(`${token.markup}${token.info}`)) {
            throw new Error('Fence end line not found');
        }
        offset += fenceBegin.length;
    } else {
        offset -= 1;
    }

    rawLines.forEach((rawLine, index) => {
        offset += 1;

        const linePos = linePosList[index];
        const line = lines[index];
        if (passTranslation.test(line)) {
            offset += rawLine.length;
            return;
        }

        const lOffset = linePos ? linePos.start : rawLine.indexOf(line);
        if (lOffset === -1) {
            throw new Error('Line not found in raw line');
        }

        offset += lOffset;

        const inline = new Token('inline', '', 0);
        inline.attrSet('idPostfix', '_code');
        inline.content = line;
        tokenExtraMap.set(inline, {
            start: offset,
            end: offset + line.length,
            level: level + 1,
        });
        inline.children = [];
        token.children?.push(inline);

        mdFence.inline.parse(line, mdFence, null, inline.children);
        const levelTokenType: string[] = ['inline'];
        childrenTokenSearch(
            mdData,
            tokenExtraMap,
            inline.children,
            levelTokenType,
            offset,
            level + 2,
        );

        offset += rawLine.length - lOffset;
    });
}

export function skipImageName(mdData: string, tokenExtraMap: TokenExtraMap, token: Token) {
    const {level} = getExtraToken(tokenExtraMap, token);
    const children = token.children;
    if (!children?.length) {
        return;
    }

    const {start, end} = getTokenChildrenPos(tokenExtraMap, children);
    const raw = mdData.slice(start, end);
    if (!passTranslation.test(raw)) {
        return;
    }

    const imageNameToken = new Token('image_name', '', 0);
    imageNameToken.content = raw;
    tokenExtraMap.set(imageNameToken, {
        start,
        end,
        level: level + 1,
    });

    children.splice(0);
    children.push(imageNameToken);
}
