import MarkdownIt from 'markdown-it';
import {RuleCore} from 'markdown-it/lib/parser_core';

const tokenize: RuleCore = function (state) {
  const tokens = state.tokens;

  for (let i = 0, len = tokens.length; i < len; i++) {
    const blockToken = tokens[i];
    if (blockToken.type !== 'inline') continue;

    blockToken.children?.forEach((token) => {
      if (token.type === 'text_special') {
        // eslint-disable-next-line no-param-reassign
        token.content = token.markup;
      }
    });
  }
};

export function textJoinFix(md: MarkdownIt) {
  md.core.ruler.before('text_join', 'textJoinFix', tokenize);
}
