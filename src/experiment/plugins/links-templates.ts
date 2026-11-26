import MarkdownIt from 'markdown-it';

type Token = MarkdownIt.Token;
const NativeToken = MarkdownIt.Token;

/* eslint-disable no-param-reassign */

const TEMPLATE = '{#T}';

const tokenize: Parameters<MarkdownIt.MarkdownIt['core']['ruler']['push']>[1] = function (state) {
    const rootTokens = state.tokens;

    const next = (tokens: Token[]) => {
        for (let i = 0, len = tokens.length; i < len; i++) {
            const isLinkOpen = tokens[i].type === 'link_open';
            if (isLinkOpen) {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    i++;
                    const token = tokens[i];
                    if (token.type === 'link_close') {
                        break;
                    }
                    if (token.type === 'text') {
                        if (token.content === TEMPLATE) {
                            const templateToken = new NativeToken('link_template', '', 0);
                            templateToken.content = token.content;
                            tokens.splice(i, 1, templateToken);
                        }
                    }
                }
            }
            const children = tokens[i].children;
            if (children) {
                // eslint-disable-next-line callback-return
                next(children);
            }
        }
    };

    next(rootTokens);
};

export function linksTemplates(md: MarkdownIt.MarkdownIt) {
    md.core.ruler.push('linksTemplates', tokenize);
}
