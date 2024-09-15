import deflist from '@diplodoc/transform/lib/plugins/deflist';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import yfmTable from '@diplodoc/transform/lib/plugins/table';
import markdownit, {Token} from 'markdown-it';

import {passSymbols} from './constants';
import {anchor} from './plugins/anchor';
import {anchors} from './plugins/anchors';
import {attrsPlugin} from './plugins/attrs/attrs';
import {changelog} from './plugins/changelog';
import {cut} from './plugins/cut';
import {filePlugin} from './plugins/file';
import {linksTemplates} from './plugins/links-templates';
import {liquidOperator} from './plugins/liquid/liquidOperator';
import {liquidVariable} from './plugins/liquid/liquidVariable';
import {meta} from './plugins/meta';
import {note} from './plugins/notes';
import {sup} from './plugins/sup';
import {tabs} from './plugins/tabs';
import {term} from './plugins/term';
import {textJoinFix} from './plugins/textJoinFix';
import {video} from './plugins/video';
import {tokenSearch} from './tokenSearch';
import {ExtraToken, ReplacePart} from './types';
import {
    eachTokens,
    extractFenceLines,
    extractImageTitle,
    extractInlineCode,
    extractLinkTitle,
    getExtraToken,
    printMap,
    safeSlice,
    skipImageName,
    someTokens,
    tabReplace,
    toJson,
    tokenizeYaml,
    variableReplace,
} from './utils';
import {applySegmentation, trimInlineToken} from './utils/segmentation';
import {buildXliff, markTokens, prepareInlineToken} from './xliff/builder';

/* eslint-disable no-console */

const SHOW_TOKENS = false;
const SHOW_MAP = false;
const SHOW_RAW_MAP = false;
const SHOW_VARS = false;

export interface TransformOptions {
    compact?: boolean;
    showTokens?: boolean;
    showMap?: boolean;
    showRawMap?: boolean;
    showVars?: boolean;
}

export function transform(content: string, options?: TransformOptions) {
    const {
        showTokens = SHOW_TOKENS,
        showMap = SHOW_MAP,
        showRawMap = SHOW_RAW_MAP,
        showVars = SHOW_VARS,
        compact,
    } = options || {};

    let mdData = content;
    mdData = mdData.replace(/\r\n/g, '\n');

    const tokenExtraMap = new Map<Token, ExtraToken>();

    // replace tabs into spaces, cause brake parse md
    const tabReplaceResult = tabReplace(mdData, tokenExtraMap);
    const revertTabReplace = () => {
        mdData = tabReplaceResult.revert(mdData);
    };
    mdData = tabReplaceResult.data;

    // replace liquid variables (it breaks md links, cause spaces)
    const variableReplaceResult = variableReplace(mdData);
    const revertVariableReplace = () => {
        mdData = variableReplaceResult.revert(mdData);
    };
    mdData = variableReplaceResult.data;

    const mdIt = markdownit({html: true})
        .use(liquidVariable)
        .use(liquidOperator)
        .use(meta)
        .use(cut)
        .use(deflist)
        .use(imsize)
        .use(note)
        .use(sup)
        .use(tabs)
        .use(anchors)
        .use(changelog)
        .use(filePlugin)
        .use(anchor)
        .use(video)
        .use(attrsPlugin)
        .use(linksTemplates)
        .use(yfmTable)
        .use(textJoinFix)
        .use(term)
        .disable(['entity', 'html_block']);

    const allTokens = mdIt.parse(mdData, {});

    if (showTokens) {
        console.log('='.repeat(10), 'Tokens', '='.repeat(10));
        console.log(toJson(allTokens));
    }

    tokenSearch(mdData, tokenExtraMap, allTokens);

    eachTokens(allTokens, (token, _idx, tokens) => {
        if (token.type === 'link_close' && token.attrGet('withTitle')) {
            token.attrSet('withTitle', '');
            extractLinkTitle(mdIt, mdData, tokenExtraMap, token, tokens);
        }
        if (token.type === 'image') {
            skipImageName(mdData, tokenExtraMap, token);
        }
        if (token.type === 'image' && token.attrGet('withTitle')) {
            token.attrSet('withTitle', '');
            extractImageTitle(mdIt, mdData, tokenExtraMap, token, tokens);
        }
    });

    eachTokens(allTokens, (token) => {
        if (token.type === 'code_inline') {
            extractInlineCode(mdData, tokenExtraMap, token);
        }
        if (token.type === 'fence' || token.type === 'code_block') {
            extractFenceLines(mdData, tokenExtraMap, token);
        }
    });

    // decode liquid variables back
    revertVariableReplace();
    // put tabs back
    revertTabReplace();

    eachTokens(allTokens, (token, _idx) => {
        if (token.type === 'inline' && token.attrGet('yaml')) {
            const extraToken = getExtraToken(tokenExtraMap, token);
            const {start, end, level} = extraToken;
            const raw = mdData.slice(start, end);
            extraToken.yamlToken = tokenizeYaml(raw, tokenExtraMap, level);
            return true;
        }
        return false;
    });

    if (showRawMap) {
        console.log('='.repeat(10), 'Raw map', '='.repeat(10));
        printMap(mdData, allTokens, tokenExtraMap);
    }

    eachTokens(allTokens, (token, _idx, tokens) => {
        if (token.type === 'inline' && !token.attrGet('yaml')) {
            const segmentTokens = applySegmentation(mdData, token, tokenExtraMap);
            if (segmentTokens.length > 1) {
                const pos = tokens.indexOf(token);
                if (pos === -1) {
                    throw new Error('Token not found for segmentation');
                }
                tokens.splice(pos, 1, ...segmentTokens);
            }
            return true;
        }
        return false;
    });

    eachTokens(allTokens, (token) => {
        if (token.type === 'inline') {
            if (!token.children) return false;

            const {yamlToken} = getExtraToken(tokenExtraMap, token);
            const targetToken = yamlToken ?? token;
            const data = yamlToken ? yamlToken.content : mdData;

            targetToken.children = prepareInlineToken(targetToken, tokenExtraMap, data);
            return true;
        }
        return false;
    });

    eachTokens(allTokens, (token, _idx, tokens) => {
        if (token.type === 'inline' && !token.attrGet('yaml')) {
            const trimmedTokens = trimInlineToken(mdData, token, tokenExtraMap);
            if (trimmedTokens.length > 1) {
                const pos = tokens.indexOf(token);
                if (pos === -1) {
                    throw new Error('Token not found for trimming');
                }
                tokens.splice(pos, 1, ...trimmedTokens);
            }
            return true;
        }
        return false;
    });

    const replaceParts: ReplacePart[] = [];

    const typeAction = {
        inline(token: Token) {
            if (!token.children) return false;

            const extraToken = getExtraToken(tokenExtraMap, token);
            const {yamlToken} = extraToken;
            const targetToken = yamlToken ?? token;

            const hasText = someTokens(
                targetToken.children ?? [],
                (tokenLocal) => tokenLocal.type === 'text' && !passSymbols.test(tokenLocal.content),
            );

            if (hasText) {
                const postfix = token.attrGet('idPostfix') ?? '';
                const id = `${replaceParts.length + 1}${postfix}`;
                replaceParts.push({...extraToken, token, id});

                markTokens(targetToken.children ?? [], tokenExtraMap);
            }
            return true;
        },
    };
    eachTokens(allTokens, (token) => {
        const handler = typeAction[token.type as keyof typeof typeAction];
        if (handler) {
            return handler(token);
        }
        return false;
    });

    if (showMap) {
        console.log('='.repeat(10), 'Map', '='.repeat(10));
        printMap(mdData, allTokens, tokenExtraMap);
    }

    const variableTextMap: Map<string, string> = new Map();
    let outMd = mdData;
    let offset = 0;
    replaceParts.forEach(({start, end, id, yamlToken}) => {
        const variable = `%%%${id}%%%`;
        const raw = safeSlice(mdData, start, end);
        outMd = outMd.slice(0, start + offset) + variable + outMd.slice(end + offset);
        offset -= raw.length - variable.length;

        const value = yamlToken ? yamlToken.content : raw;
        variableTextMap.set(id, value);
    });

    if (showVars) {
        console.log('='.repeat(10), 'Variables', '='.repeat(10));
        variableTextMap.forEach((text, index) => {
            console.log(index, JSON.stringify(text));
        });
    }

    const xliff = buildXliff(replaceParts, tokenExtraMap, mdData, compact);

    return {skeleton: outMd, variables: variableTextMap, xliff};
}
