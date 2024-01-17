import assert from 'assert';
import {XLFTagToken, XLFTextToken, XLFToken, isXLFTagToken, isXLFTextToken} from 'src/xlf/token';

export type XLFMDRendererRuleSet = {
    text: XLFMDRendererRule;
    [key: string]: XLFMDRendererRule;
};

export type XLFMDRendererRule = (token: XLFToken) => string;

class XLFMDRenderer {
    rules: XLFMDRendererRuleSet;

    constructor() {
        this.rules = {
            text: this.text.bind(this),
            tag: this.tag.bind(this),
            x: this.x.bind(this),

            // simple pair syntax
            // strong
            strong_open: this.literal.bind(this),
            strong_close: this.literal.bind(this),
            // em
            em_open: this.literal.bind(this),
            em_close: this.literal.bind(this),
            // s
            s_open: this.literal.bind(this),
            s_close: this.literal.bind(this),
            // sup
            sup_open: this.literal.bind(this),
            sup_close: this.literal.bind(this),
            // samp
            samp_open: this.literal.bind(this),
            samp_close: this.literal.bind(this),
            // code
            code_open: this.literal.bind(this),
            code_close: this.literal.bind(this),

            // link
            link_text_part_open: this.literal.bind(this),
            link_text_part_close: this.literal.bind(this),
            link_attributes_part_open: this.literal.bind(this),
            link_attributes_part_close: this.literal.bind(this),
            link_attributes_href: this.literal.bind(this),
            link_attributes_title_open: this.prependSpaceLiteral.bind(this),
            link_attributes_title_close: this.literal.bind(this),
            link_autolink: this.literal.bind(this),
            link_reflink: this.literal.bind(this),

            // image
            image_text_part_open: this.literal.bind(this),
            image_text_part_close: this.literal.bind(this),
            image_attributes_part_open: this.literal.bind(this),
            image_attributes_part_close: this.literal.bind(this),
            image_attributes_src: this.literal.bind(this),
            image_attributes_title_open: this.prependSpaceLiteral.bind(this),
            image_attributes_title_close: this.literal.bind(this),
            image_attributes_size: this.prependSpaceLiteral.bind(this),

            // video
            video: this.literal.bind(this),

            // anchor
            anchor: this.literal.bind(this),

            // file
            file_open: this.literal.bind(this),
            file_src: this.prependSpaceLiteral.bind(this),
            file_name_open: this.prependSpaceLiteral.bind(this),
            file_name_close: this.literal.bind(this),
            file_referrerpolicy: this.prependSpaceLiteral.bind(this),
            file_rel: this.prependSpaceLiteral.bind(this),
            file_target: this.prependSpaceLiteral.bind(this),
            file_type: this.prependSpaceLiteral.bind(this),
            file_close: this.prependSpaceLiteral.bind(this),

            // liquid
            liquid_If: this.literal.bind(this),
            liquid_Else: this.literal.bind(this),
            liquid_EndIf: this.literal.bind(this),
            liquid_ForInLoop: this.literal.bind(this),
            liquid_EndForInLoop: this.literal.bind(this),
            liquid_Function: this.literal.bind(this),
            liquid_Filter: this.literal.bind(this),
            liquid_Variable: this.literal.bind(this),

            // html
            html_inline: this.literal.bind(this),
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

    prependSpaceLiteral(token: XLFToken): string {
        return ' ' + this.literal(token);
    }

    literal(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText} = token;
        assert(
            equivText?.length,
            'literal tag should contain original markup inside equiv-text attritbute',
        );

        return equivText;
    }
}

export {XLFMDRenderer};
export default {XLFMDRenderer};
