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
            g: this.g.bind(this),
            strong: this.strong.bind(this),
            em: this.em.bind(this),
            s: this.s.bind(this),
            sup: this.sup.bind(this),
            samp: this.samp.bind(this),
            x: this.x.bind(this),
            code: this.code.bind(this),
            link_text_part: this.linkTextPart.bind(this),
            link_attributes_part: this.linkAttributesPart.bind(this),
            link_attributes_title: this.linkAttributesTitle.bind(this),
            link_attributes_href: this.linkAttributesHref.bind(this),
            link_reflink: this.linkRefLink.bind(this),
            link_autolink: this.linkAutolink.bind(this),
            image_text_part: this.imageTextPart.bind(this),
            image_attributes_part: this.imageAttributesPart.bind(this),
            image_attributes_src: this.imageAttributesSrc.bind(this),
            image_attributes_title: this.imageAttributesTitle.bind(this),
            image_attributes_size: this.imageAttributesSize.bind(this),
            video: this.video.bind(this),
            anchor: this.anchor.bind(this),
            file: this.file.bind(this),
            file_src: this.fileAttributeNonTranslatable.bind(this),
            file_name: this.fileAttributeTranslatable.bind(this),
            file_referrerpolicy: this.fileAttributeNonTranslatable.bind(this),
            file_rel: this.fileAttributeNonTranslatable.bind(this),
            file_target: this.fileAttributeNonTranslatable.bind(this),
            file_type: this.fileAttributeNonTranslatable.bind(this),
            liquid_If: this.liquidAsIs.bind(this),
            liquid_Else: this.liquidAsIs.bind(this),
            liquid_EndIf: this.liquidAsIs.bind(this),
            liquid_ForInLoop: this.liquidAsIs.bind(this),
            liquid_EndForInLoop: this.liquidAsIs.bind(this),
            liquid_Function: this.liquidAsIs.bind(this),
            liquid_Filter: this.liquidAsIs.bind(this),
            liquid_Variable: this.liquidAsIs.bind(this),
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

    strong(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;
        if (!token?.equivText) {
            throw new Error(`token: ${token} missing equiv-text`);
        }

        return token.equivText ?? '**';
    }

    em(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;
        if (!token?.equivText) {
            throw new Error(`token: ${token} missing equiv-text`);
        }

        return token.equivText ?? '*';
    }

    s(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        if (!token?.equivText) {
            throw new Error(`token: ${token} missing equiv-text`);
        }

        return token.equivText ?? '~~';
    }

    sup(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        if (!token?.equivText) {
            throw new Error(`token: ${token} missing equiv-text`);
        }

        return token.equivText ?? '^';
    }

    samp(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        if (!token?.equivText) {
            throw new Error(`token: ${token} missing equiv-text`);
        }

        return token.equivText ?? '##';
    }

    linkTextPart(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText, nodeType} = token;

        if (equivText?.length !== 2) {
            throw new Error(`token: ${token} has invalid equiv-text`);
        }

        const [open, close] = equivText.split('');

        return nodeType === 'open' ? open : close;
    }

    linkAttributesPart(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText, nodeType} = token;

        if (equivText?.length !== 2) {
            throw new Error(`token: ${token} has invalid equiv-text`);
        }

        const [open, close] = equivText.split('');

        return nodeType === 'open' ? open : close;
    }

    linkAttributesHref(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        assert(
            token.equivText?.length,
            `x supposed to wrap original link href markup inside equiv-text`,
        );

        return token.equivText;
    }

    linkAttributesTitle(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText, nodeType} = token;

        if (equivText?.length !== 2) {
            throw new Error(`token: ${token} has invalid equiv-text`);
        }

        const [open, close] = equivText.split('');

        return nodeType === 'open' ? ' ' + open : close;
    }

    linkRefLink(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        assert(
            token.equivText?.length,
            `x supposed to wrap original ref link markup inside equiv-text`,
        );

        return token.equivText;
    }

    linkAutolink(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        assert(
            token.equivText?.length,
            `x supposed to wrap original ref link markup inside equiv-text`,
        );

        return token.equivText;
    }

    imageTextPart(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText, nodeType} = token;
        if (equivText?.length !== 3) {
            throw new Error(`token: ${token} has invalid equiv-text`);
        }

        const [open, close] = equivText.split(/(\]$)/gmu);
        return nodeType === 'open' ? open : close;
    }

    imageAttributesPart(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText, nodeType} = token;
        if (equivText?.length !== 2) {
            throw new Error(`token: ${token} has invalid equiv-text`);
        }

        const [open, close] = equivText.split('');

        return nodeType === 'open' ? open : close;
    }

    imageAttributesSrc(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        if (!token?.equivText?.length) {
            throw new Error(`x supposed to wrap image src inside equiv-text`);
        }

        return token.equivText;
    }

    imageAttributesTitle(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText, nodeType} = token;
        if (equivText?.length !== 2) {
            throw new Error(`token: ${token} has invalid equiv-text`);
        }

        const [open, close] = equivText.split('');

        return nodeType === 'open' ? ' ' + open : close;
    }

    imageAttributesSize(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        assert(token.equivText?.length, `token: ${token} has invalid equiv-text`);

        return ' ' + token.equivText;
    }

    code(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        assert(token.equivText?.length, `token: ${token} has invalid equiv-text`);

        return token.equivText;
    }

    video(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        assert(token.equivText?.length, `token: ${token} has invalid equiv-text`);

        return token.equivText;
    }

    anchor(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        assert(token.equivText?.length, `token: ${token} has invalid equiv-text`);

        return token.equivText;
    }

    file(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText, nodeType} = token;
        assert(equivText?.length === 4, `token: ${token} has invalid equiv-text`);

        const [open, close] = equivText.split(/(%\}$)/gmu);

        return nodeType === 'open' ? `${open} file` : ` ${close}`;
    }

    fileAttributeNonTranslatable(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText} = token;
        assert(equivText?.length, `token: ${token} has invalid equiv-text`);

        return equivText;
    }

    fileAttributeTranslatable(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {syntax, nodeType, equivText} = token;
        assert(syntax?.length, `token: ${token} has invalid syntax name`);

        const [_, name] = syntax.split('_');
        assert(name?.length, `token: ${token} has invalid syntax name`);
        assert(equivText?.length === 2, `token: ${token} has invalid equiv-text`);

        const [open, close] = equivText.split('');

        return nodeType === 'open' ? ` ${name}=${open}` : close;
    }

    liquidAsIs(token: XLFToken): string {
        assert(isXLFTagToken(token));
        token as XLFTagToken;

        const {equivText} = token;
        assert(equivText?.length, `token: ${token} has invalid equiv-text`);

        return equivText;
    }
}

export {XLFMDRenderer};
export default {XLFMDRenderer};
