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
    begin: string;
    end: string;
    syntax?: string;
    equivText?: string;
};

const xliffTagTokenNodeTypes = new Set(['open', 'close', 'self-closing']);

export function isXLFTextToken(token: XLFToken): token is XLFTextToken {
    return token?.type === 'text';
}

export function isXLFTagToken(token: XLFToken): token is XLFTagToken {
    return token?.type === 'tag' && xliffTagTokenNodeTypes.has(token.nodeType);
}
