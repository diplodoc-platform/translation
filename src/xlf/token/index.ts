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
