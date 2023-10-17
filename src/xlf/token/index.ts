export type XLFToken = XLFTextToken | XLFTagToken;

export type XLFTextToken = {
    type: 'text';
    data: string;
};

export type NodeTypes = 'open' | 'close' | 'self-closing';

export type XLFTagToken = {
    type: 'tag';
    data: string;
    nodeType: NodeTypes;
    syntax?: string;
    equivText?: string;
};

function isXLFTextToken(token: XLFToken): token is XLFTextToken {
    return token?.type === 'text';
}

const xlfTagTokenNodeTypes = new Set(['open', 'close']);

function isXLFTagToken(token: XLFToken): token is XLFTagToken {
    return token?.type === 'tag' && xlfTagTokenNodeTypes.has(token.nodeType);
}

export {isXLFTextToken, isXLFTagToken};
export default {isXLFTextToken, isXLFTagToken};
