import type {MarkdownIt} from 'markdown-it';

import {eachTokens} from '../utils';

const tokenize: Parameters<MarkdownIt['core']['ruler']['push']>[1] = (state) => {
    eachTokens(state.tokens, (token) => {
        if (token.type === 'text_special') {
            // eslint-disable-next-line no-param-reassign
            token.content = token.markup;
        }
    });
};

export function textJoinFix(md: MarkdownIt) {
    md.core.ruler.before('text_join', 'textJoinFix', tokenize);
}
