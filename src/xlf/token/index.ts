export type XLFToken = XLFTextToken | XLFTagToken;

export type XLFTextToken = {
    type: 'text';
    data: string;
};

export type XLFTagToken = {
    type: 'tag';
    data: string;
    ctype?: string;
    equivText?: string;
};

function isXLFTextToken(token: XLFToken): token is XLFTextToken {
    return token?.type === 'text';
}

function isXLFTagToken(token: XLFToken): token is XLFTagToken {
    return token?.type === 'tag';
}

export {isXLFTextToken, isXLFTagToken};
export default {isXLFTextToken, isXLFTagToken};
