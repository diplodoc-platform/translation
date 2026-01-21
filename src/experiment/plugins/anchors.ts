import type MarkdownIt from 'markdown-it';
import type {RuleCore} from 'markdown-it/lib/parser_core';

import Token from 'markdown-it/lib/token';

/* eslint-disable no-param-reassign */

const CUSTOM_ID_REGEXP = /\[?{ ?#(\S+) ?}]?/;
const CUSTOM_ID_REGEXP_G = new RegExp(CUSTOM_ID_REGEXP.source, 'g');

const tokenize: RuleCore = function (state) {
    const tokens = state.tokens;
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];
        const isHeading = token.type === 'heading_open';

        if (isHeading) {
            const inlineToken = tokens[i + 1];

            const children = inlineToken.children || [];
            children.forEach((tokenLocal, idx) => {
                if (tokenLocal.type !== 'text') return;
                if (!CUSTOM_ID_REGEXP.test(tokenLocal.content)) return;

                const newTokens: Token[] = [];
                let lastPos = 0;
                tokenLocal.content.replace(CUSTOM_ID_REGEXP_G, (raw, id, pos, str) => {
                    const textToken = new Token('text', '', 0);
                    textToken.content = str.slice(lastPos, pos);
                    lastPos = pos + raw.length;
                    newTokens.push(textToken);

                    const hashToken = new Token('header_id', '', 0);
                    hashToken.content = id;
                    newTokens.push(hashToken);
                    return '';
                });
                children.splice(idx, 1, ...newTokens);
            });

            i += 3;
            continue;
        }

        i++;
    }
};

export function anchors(md: MarkdownIt) {
    try {
        md.core.ruler.after('curly_attributes', 'anchors', tokenize);
    } catch {
        md.core.ruler.push('anchors', tokenize);
    }
}
