import assert from 'assert';
import {XLFTagToken, XLFTextToken, XLFToken, isXLFTagToken, isXLFTextToken} from 'src/xlf/token';

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

const spaced = (actor: (token: XLFToken) => string) => (token: XLFToken) => ' ' + actor(token);
const quoted = (actor: (token: XLFToken) => string) => (token: XLFToken) =>
    '"' + actor(token) + '"';
const attr = spaced(quoted(literal));

class XLFMDRenderer {
    rules: XLFMDRendererRuleSet;

    constructor() {
        this.rules = {
            text: this.text.bind(this),
            tag: this.tag.bind(this),
            x: this.x.bind(this),

            // simple pair syntax
            // strong
            strong_open: literal,
            strong_close: literal,
            // em
            em_open: literal,
            em_close: literal,
            // s
            s_open: literal,
            s_close: literal,
            // sup
            sup_open: literal,
            sup_close: literal,
            // samp
            samp_open: literal,
            samp_close: literal,
            // code
            code_open: literal,
            code_close: literal,

            // link
            link_text_part_open: literal,
            link_text_part_close: literal,
            link_attributes_part_open: literal,
            link_attributes_part_close: literal,
            link_attributes_href: literal,
            link_attributes_title: attr,
            link_autolink: literal,
            link_reflink: literal,

            // image
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
            liquid_Include: literal,
            liquid_ListTabs: literal,
            liquid_EndListTabs: literal,
            liquid_If: literal,
            liquid_Else: literal,
            liquid_EndIf: literal,
            liquid_ForInLoop: literal,
            liquid_EndForInLoop: literal,
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

export {XLFMDRenderer};
export default {XLFMDRenderer};
