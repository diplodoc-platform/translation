import type MdIt from 'markdown-it';
import type State from 'markdown-it/lib/rules_core/state_core';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline';

import {token} from 'src/utils';

import {Liquid} from '../liquid';

const INCLUDE_REGEXP = /^{%\s*include\s*(notitle)?\s*\[(.+?)]\((.+?)\)\s*%}$/;
const INCLUDE_REGEXP_2 = /^{%\s*include\s*(notitle)?\s*\[(.+?)]\((.+?)\)\s*%}/;

export default function (md: MdIt) {
    const block = (state: State) => {
        const {tokens} = state;
        let i = 0;

        while (i < tokens.length) {
            const openToken = tokens[i];
            const contentToken = tokens[i + 1];
            const closeToken = tokens[i + 2];

            const match = contentToken?.content?.match(INCLUDE_REGEXP);

            if (
                openToken.type === 'paragraph_open' &&
                contentToken.type === 'inline' &&
                match &&
                closeToken.type === 'paragraph_close'
            ) {
                let titleTokens = [];
                if (match[2]) {
                    const tokenizer = new Liquid(match[2]);
                    titleTokens = tokenizer.tokenize() as Token[];
                } else {
                    titleTokens = [
                        token('liquid', {
                            content: '',
                            skip: contentToken.content,
                            markup: contentToken.content,
                            subtype: 'Include',
                        }),
                    ];
                }

                contentToken.children = [...titleTokens];

                i += 3;
            } else {
                i++;
            }
        }
    };

    const inline = (state: StateInline) => {
        const ch1 = state.src[state.pos];
        const ch2 = state.src[state.pos + 1];

        if (ch1 + ch2 === '{%') {
            const match = INCLUDE_REGEXP_2.exec(state.src.slice(state.pos));

            if (match) {
                state.pos += match[0].length;

                const token = state.push('liquid', '', 0) as Token;
                token.skip = match[0];
                token.markup = match[0];
                token.subtype = 'Include';

                return true;
            }
        }

        return false;
    };

    md.core.ruler.before('linkify', 'includes', block);
    md.inline.ruler.before('linkify', 'includes', inline);
}
