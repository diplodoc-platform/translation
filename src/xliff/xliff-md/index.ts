import type {XLFTagToken, XLFTextToken, XLFToken} from '../token';

import assert from 'assert';

import {escapeSubscriptBody} from 'src/utils/subscript';

import {isXLFTagToken, isXLFTextToken} from '../token';

function assertTagToken(token: XLFToken): asserts token is XLFTagToken {
    assert(isXLFTagToken(token));
}

function isGroup(token: XLFToken): token is XLFTagToken {
    return isXLFTagToken(token) && token.data === 'g';
}

function findGroupEnd(tokens: XLFToken[], start: number) {
    let depth = 1;
    for (let index = start; index < tokens.length; index++) {
        const token = tokens[index];
        if (!isGroup(token)) {
            continue;
        }
        if (token.nodeType === 'open') {
            depth++;
        } else if (token.nodeType === 'close') {
            depth--;
        }
        if (!depth) {
            return index;
        }
    }
    assert.fail('Subscript translation group must be closed');
}

function assertTextToken(token: XLFToken): asserts token is XLFTextToken {
    assert(isXLFTextToken(token));
}

export type XLFMDRendererRuleSet = {
    text: XLFMDRendererRule;
    [key: string]: XLFMDRendererRule;
};

export type XLFMDRendererRule = (token: XLFToken) => string;

const literal = (token: XLFToken): string => {
    assertTagToken(token);

    const {equivText} = token;
    assert(
        equivText?.length,
        'literal tag should contain original markup inside equiv-text attritbute',
    );

    return equivText;
};

const literallb = (token: XLFToken): string => {
    assertTagToken(token);

    const equivText = token.equivText?.replace(/&#10;/g, '\n');
    assert(
        equivText?.length,
        'literal tag should contain original markup inside equiv-text attritbute',
    );

    return equivText;
};

const openclose = (token: XLFToken) => {
    assertTagToken(token);

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

function quoteFileName(name: string, original: string) {
    const alternative = original === "'" ? '"' : "'";
    const quote = name.includes(original) ? alternative : original;
    if (!name || name.includes(quote)) {
        throw new Error(
            'A file name must be nonempty and cannot contain both single and double quotes.',
        );
    }
    return quote + name + quote;
}

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
            // underline and subscript
            underline: openclose,
            underline_open: literal,
            underline_close: literal,
            sub: openclose,
            sub_open: literal,
            sub_close: literal,
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
            file_markup: literal,
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

            // no-translate
            no_translate_inline: literal,
            footnote_ref: literal,
            task_marker: literal,
            translation_directive_marker: literal,
        };
    }

    render(tokens: XLFToken[]): string {
        let rendered = '';
        let nameStart = 0;

        let index = 0;
        while (index < tokens.length) {
            const token = tokens[index++];
            if (isGroup(token) && token.syntax === 'file_name') {
                if (token.nodeType === 'open') {
                    nameStart = rendered.length;
                } else {
                    const name = quoteFileName(rendered.slice(nameStart), token.begin);
                    rendered = rendered.slice(0, nameStart) + name;
                }
                continue;
            }

            if (isGroup(token) && token.syntax === 'sub' && token.nodeType === 'open') {
                const end = findGroupEnd(tokens, index);
                const body = this.render(tokens.slice(index, end));
                rendered += token.begin + escapeSubscriptBody(body) + token.end;
                index = end + 1;
                continue;
            }

            const handler = this.rules[token.type];
            if (handler) {
                rendered += handler(token);
            }
        }

        return rendered;
    }

    text(token: XLFToken): string {
        assertTextToken(token);

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
        assertTagToken(token);

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
        assertTagToken(token);

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
