import markdownit, {Token} from 'markdown-it';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';

import {LinePosition, TokenExtraMap} from './types';
import {toJsonF} from './utils';

/* eslint-disable no-console */

const md = markdownit();

const passTokens = [
    'heading_close',
    'paragraph_close',
    'list_item_close',
    'bullet_list_close',
    'ordered_list_close',
];

const rawBlocks = ['code_block'];

export function tokenSearch(mdData: string, tokenExtraMap: TokenExtraMap, allTokens: Token[]) {
    const mdDataLines = mdData.split(/\n/);

    const levelTokenType: string[] = [];

    let lastPos = 0;
    allTokens.forEach((token) => {
        const {level} = token;
        levelTokenType[level] = token.type;
        levelTokenType.splice(level + 1);

        if (passTokens.includes(token.type)) {
            tokenExtraMap.set(token, {
                start: lastPos,
                end: lastPos,
                level,
            });
            return;
        }

        // here we can check position
        if (token.map) {
            let [lineStart] = token.map;
            // yfm table map bug
            if (token.type === 'yfm_table_close') {
                lineStart -= 2;
            } else if (token.type === 'yfm_tbody_open') {
                lineStart -= 1;
            }

            const rawStartPos = getRawStartPos(mdDataLines, lineStart);
            if (lastPos < rawStartPos) {
                lastPos = rawStartPos;
            }
        }

        let linePosList: LinePosition[] | undefined;
        let content;
        let pos;
        if (rawBlocks.includes(token.type)) {
            if (!token.map) {
                throw new Error('Raw block without map');
            }
            const [lineStart, lineEnd] = token.map;
            content = getRawContent(mdDataLines, lineStart, lineEnd);
            pos = mdData.indexOf(content, lastPos);
        } else {
            content = getTokenContent(token);
            if (levelTokenType.includes('table_open')) {
                // fix table escape pipe `|`
                content = content.replace(/\|/g, '\\|');
            }
            const result = searchRawByLine(mdData, content, lastPos);
            content = result.content;
            linePosList = result.linePosList;
            pos = mdData.indexOf(content, lastPos);
        }
        if (pos === -1) {
            console.error(
                toJsonF({
                    fragment: mdData.slice(lastPos, lastPos + 100),
                    content,
                }),
            );
            throw new Error('Content pos not found');
        }
        const start = pos;
        const end = pos + content.length;
        lastPos = end;

        tokenExtraMap.set(token, {
            start,
            end,
            level,
            linePosList,
        });

        if (token.children) {
            childrenTokenSearch(
                mdData,
                tokenExtraMap,
                token.children,
                levelTokenType,
                pos,
                level + 1,
            );
        }
    });
}

export function childrenTokenSearch(
    mdData: string,
    tokenExtraMap: TokenExtraMap,
    tokens: Token[],
    levelTokenType: string[],
    startPos: number,
    level: number,
) {
    let lastPos = startPos;
    for (let i = 0, len = tokens.length; i < len; i++) {
        const token = tokens[i];
        // eslint-disable-next-line no-param-reassign
        levelTokenType[level] = token.type;
        levelTokenType.splice(level + 1);
        let content;
        if (['link_open', 'link_close', 'image'].includes(token.type)) {
            content = getSpecialTokenContent(token, mdData, lastPos);
        } else {
            content = getTokenContent(token);
        }
        if (levelTokenType.includes('table_open')) {
            // fix table escape pipe `|`
            content = content.replace(/\|/g, '\\|');
        }
        let linePosList: LinePosition[] | undefined;
        // code_inline strip new line and trim string
        if (token.type === 'code_inline') {
            const result = searchRawByWords(mdData, content, lastPos);
            content = result.content;
            linePosList = result.linePosList;
        } else {
            const result = searchRawByLine(mdData, content, lastPos);
            content = result.content;
        }
        const pos = mdData.indexOf(content, lastPos);
        if (pos === -1) {
            console.error(
                toJsonF({
                    fragment: mdData.slice(lastPos, lastPos + 100),
                    content,
                }),
            );
            throw new Error('Children content pos not found');
        }

        const start = pos;
        const end = pos + content.length;
        lastPos = end;

        tokenExtraMap.set(token, {
            start,
            end,
            level,
            linePosList,
        });

        if (token.children) {
            childrenTokenSearch(
                mdData,
                tokenExtraMap,
                token.children,
                levelTokenType,
                pos,
                level + 1,
            );
        }
    }
}

function getRawStartPos(lines: string[], start: number) {
    if (start === 0) {
        return 0;
    }
    return lines.slice(0, start).join('\n').length + 1;
}

function getRawContent(lines: string[], start: number, end: number) {
    return lines.slice(start, end).join('\n') + (lines.length > end ? '\n' : '');
}

function getTokenContent(token: Token) {
    switch (token.type) {
        case 'heading_open': {
            // this tag after content
            if (['=', '-'].includes(token.markup)) {
                return '';
            } else {
                return token.markup;
            }
        }
        case 'list_item_open': {
            return `${token.info}${token.markup}`;
        }
        case 'strong_close':
        case 'strong_open': {
            return token.markup;
        }
        case 'em_close':
        case 'em_open': {
            return token.markup;
        }
        case 's_open':
        case 's_close': {
            return token.markup;
        }
        case 'hardbreak':
        case 'softbreak': {
            return '\n';
        }
        case 'hr': {
            return token.markup;
        }
        case 'sup_open':
        case 'sup_close': {
            return token.markup;
        }
        case 'yfm_table_open': {
            return '#|';
        }
        case 'yfm_table_close': {
            return '|#';
        }
        case 'yfm_tr_open': {
            return '||';
        }
        case 'code_inline': {
            return `${token.markup} ${token.content} ${token.markup}`;
        }
        case 'fence': {
            return `${token.markup}${token.info}\n${token.content}`;
        }
    }
    return token.content;
}

const openCloseChar = {
    '(': ')',
    '[': ']',
};

function getSpecialTokenContent(token: Token, mdData: string, lastPos: number) {
    switch (token.type) {
        case 'image': {
            const imageStartPos = mdData.indexOf('![', lastPos);
            if (imageStartPos === -1) {
                throw new Error('Image name start pos not found');
            }

            const imageLabelStartPos = imageStartPos + 1;
            const imageLabelEndPos = readLinkLabel(mdData, imageLabelStartPos);

            const imageNameEndPos = mdData.indexOf(']', imageLabelEndPos);
            if (imageNameEndPos === -1) {
                throw new Error('Image name end pos not found');
            }

            const imageLinkEndPos = readLink(mdData, imageNameEndPos, token);
            return mdData.slice(imageStartPos, imageLinkEndPos + 1);
        }
        case 'link_open': {
            if (token.markup === 'autolink') {
                return '<';
            }
            return '[';
        }
        case 'link_close': {
            if (token.markup === 'autolink') {
                return '>';
            }
            const endTextPos = mdData.indexOf(']', lastPos);
            if (endTextPos === -1) {
                throw new Error('Link name separator not found');
            }

            const endLink = readLink(mdData, endTextPos, token);
            return mdData.slice(endTextPos, endLink + 1);
        }
    }
    return token.content;
}

function searchRawByLines(fragment: string, searchLines: string[], lastPos: number) {
    const linePosList: LinePosition[] = new Array(searchLines.length);
    let firstItemPos = -1;
    let subOffsetPos = lastPos;
    let isFirstFired = false;
    searchLines.forEach((lineRaw) => {
        const linePos = {
            start: 0,
        };
        linePosList.push(linePos);
        const line = lineRaw;
        if (!line) return;
        const pos = fragment.indexOf(line, subOffsetPos);
        if (pos === -1) {
            console.error(
                toJsonF({
                    fragment: fragment.slice(subOffsetPos, subOffsetPos + 100),
                    searchLines,
                }),
            );
            throw new Error('Line not found');
        }
        if (!isFirstFired) {
            isFirstFired = true;
            firstItemPos = pos;
        }
        subOffsetPos = pos + line.length;
        linePos.start = pos;
    });
    if (!isFirstFired) {
        firstItemPos = lastPos;
    }
    const content = fragment.slice(firstItemPos, subOffsetPos);
    return {
        content,
        linePosList,
    };
}

function searchRawByLine(fragment: string, search: string, lastPos: number) {
    const searchLines = search.split(/\n/);
    return searchRawByLines(fragment, searchLines, lastPos);
}

function searchRawByWords(fragment: string, search: string, lastPos: number) {
    const searchLines = search.split(/[\n\s]/);
    return searchRawByLines(fragment, searchLines, lastPos);
}

function readLink(mdData: string, endTextPos: number, token: Token) {
    const linkBeginCharPos = endTextPos + 1;
    const nextChar = mdData[linkBeginCharPos];
    const closeChar = openCloseChar[nextChar as keyof typeof openCloseChar];
    if (!closeChar) {
        throw new Error('Unknown link type');
    }

    const linkBegin = linkBeginCharPos + 1;
    let linkTitleEnd = linkBegin;
    if (nextChar === '[') {
        linkTitleEnd = readLinkLabel(mdData, linkBeginCharPos);
    } else {
        const {pos, titleStart, titleEnd} = readLinkTitle(mdData, linkBegin);
        if (pos !== undefined) {
            linkTitleEnd = pos;
            if (titleStart !== undefined && titleEnd !== undefined) {
                token.attrSet('withTitle', 'true');
                // eslint-disable-next-line no-param-reassign
                token.meta = {
                    titleStart: titleStart - endTextPos,
                    titleEnd: titleEnd - endTextPos,
                };
            }
        }
    }

    const endLink = mdData.indexOf(closeChar, linkTitleEnd);
    if (endLink === -1) {
        throw new Error('Link end not found');
    }
    return endLink;
}

function readLinkTitle(mdData: string, startPos: number) {
    const max = getMax(mdData, startPos);
    let pos = startPos;

    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    pos = passWhiteSpace(mdData, pos, max);
    if (pos >= max) {
        return {};
    }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    const destResult = md.helpers.parseLinkDestination(mdData, pos, max);
    if (destResult.ok) {
        const href = md.normalizeLink(destResult.str);
        if (md.validateLink(href)) {
            pos = destResult.pos;
        }
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    const start = pos;
    pos = passWhiteSpace(mdData, pos, max);

    let titleStart;
    let titleEnd;
    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    const titleResult = md.helpers.parseLinkTitle(mdData, pos, max);
    if (pos < max && start !== pos && titleResult.ok) {
        titleStart = pos + 1;
        pos = titleResult.pos;
        titleEnd = pos - 1;

        // [link](  <href>  "title"  )
        //                         ^^ skipping these spaces
        pos = passWhiteSpace(mdData, pos, max);
    }

    return {
        titleStart,
        titleEnd,
        pos,
    };
}

function readLinkLabel(mdData: string, startPos: number) {
    const max = getMax(mdData, startPos);
    let pos = startPos;

    const state = new StateInline(mdData, md, {}, []);
    state.pos = pos;
    state.posMax = max;

    if (pos < max && mdData.charCodeAt(pos) === 0x5b /* [ */) {
        pos = md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) {
            // pass
        } else {
            throw new Error('Link label not found');
        }
    } else {
        throw new Error('Link label not closed');
    }

    return pos;
}

function passWhiteSpace(mdData: string, startPos: number, initMax?: number) {
    const max = initMax ?? getMax(mdData, startPos);

    let pos = startPos;
    for (; pos < max; pos++) {
        const code = mdData.charCodeAt(pos);
        if (code !== 0x20 && code !== 0x0a) {
            break;
        }
    }
    return pos;
}

function getMax(mdData: string, startPos: number) {
    let max = mdData.indexOf('\n', startPos);
    if (max === -1) {
        max = mdData.length;
    }
    return max;
}
