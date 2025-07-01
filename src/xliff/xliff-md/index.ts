import assert from 'assert';

import {XLFTagToken, XLFTextToken, XLFToken, isXLFTagToken, isXLFTextToken} from '../token';

export type XLFMDRendererRuleSet = {
    text: XLFMDRendererRule;
    [key: string]: XLFMDRendererRule;
};

export type XLFMDRendererRule = (token: XLFToken) => string;

const literal = (token: XLFToken): string => {
    assert(isXLFTagToken(token));
    token as XLFTagToken;

    const {equivText} = token;
    assert(
        equivText?.length,
        'literal tag should contain original markup inside equiv-text attritbute',
    );

    return equivText;
};

const literallb = (token: XLFToken): string => {
    assert(isXLFTagToken(token));
    token as XLFTagToken;

    const equivText = token.equivText?.replace(/&#10;/g, '\n');
    assert(
        equivText?.length,
        'literal tag should contain original markup inside equiv-text attritbute',
    );

    return equivText;
};

const openclose = (token: XLFToken) => {
    assert(isXLFTagToken(token));
    token as XLFTagToken;

    if (token.nodeType === 'open') {
        return token.begin;
    } else {
        return token.end;
    }
};

const spaced = (actor: (token: XLFToken) => string) => (token: XLFToken) => ' ' + actor(token);
const quoted = (actor: (token: XLFToken) => string) => (token: XLFToken) =>
    '"' + actor(token) + '"';
const attr = spaced(quoted(literal));

export class XLFMDRenderer {
    rules: XLFMDRendererRuleSet;

    constructor() {
        this.rules = {
            text: this.text.bind(this),
            tag: this.tag.bind(this),
            x: this.x.bind(this),
            g: this.g.bind(this),

            // simple pair syntax
            // strong
            bold: openclose,
            bold_open: literal,
            bold_close: literal,
            // em
            italic: openclose,
            italic_open: literal,
            italic_close: literal,
            // s
            strikethrough: openclose,
            strikethrough_open: literal,
            strikethrough_close: literal,
            // sup
            sup: openclose,
            sup_open: literal,
            sup_close: literal,
            // sup
            monospace: openclose,
            monospace_open: literal,
            monospace_close: literal,
            // samp
            samp_open: literal,
            samp_close: literal,
            // code
            code_open: literal,
            code_close: literal,

            lb: literallb,

            // link
            link: openclose,
            link_text_part_open: literal,
            link_text_part_close: literal,
            link_attributes_part_open: literal,
            link_attributes_part_close: literal,
            link_attributes_href: literal,
            link_attributes_title: attr,
            link_autolink: literal,
            link_reflink: literal,

            // image
            image: openclose,
            image_text_part_open: literal,
            image_text_part_close: literal,
            image_attributes_part_open: literal,
            image_attributes_part_close: literal,
            image_attributes_src: literal,
            image_attributes_title: attr,
            image_attributes_size: spaced(literal),

            // video
            video: literal,

            // anchor
            anchor: literal,

            // file
            file_open: literal,
            file_src: spaced(literal),
            file_name_open: spaced(literal),
            file_name_close: literal,
            file_referrerpolicy: spaced(literal),
            file_rel: spaced(literal),
            file_target: spaced(literal),
            file_type: spaced(literal),
            file_close: spaced(literal),

            // liquid
            liquid_Literal: literal,
            liquid_Include: literal,
            liquid_Function: literal,
            liquid_Filter: literal,
            liquid_Variable: literal,
            liquid_Attributes: literal,

            // html
            html_inline: literal,
        };
    }

    render(tokens: XLFToken[]): string {
        let rendered = '';

        for (const token of tokens) {
            const handler = this.rules[token.type];
            if (handler) {
                rendered += handler(token);
            }
        }

        return rendered;
    }

    text(token: XLFToken): string {
        assert(isXLFTextToken(token));
        token as XLFTextToken;

        return token.data;
    }

    tag(token: XLFToken): string {
        const handler = this.rules[token.data];
        if (!handler) {
            return '';
        }

        return handler(token);
    }

    g(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const syntax = token.syntax;
        if (!syntax?.length) {
            throw new Error("can't render g tag without syntax");
        }

        const handler = this.rules[syntax];
        if (!handler) {
            throw new Error(`syntax ${syntax} not implemented`);
        }

        return handler(token);
    }

    x(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const syntax = token.syntax;
        if (!syntax?.length) {
            throw new Error("can't render g tag without syntax");
        }

        const handler = this.rules[syntax];
        if (!handler) {
            throw new Error(`syntax ${syntax} not implemented`);
        }

        return handler(token);
    }
}

export function render(tokens: XLFToken[]) {
    const mdRenderer = new XLFMDRenderer();

    return mdRenderer.render(tokens);
}
