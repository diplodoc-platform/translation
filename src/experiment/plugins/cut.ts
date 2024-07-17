import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';
import Token from 'markdown-it/lib/token';

/* eslint-disable no-param-reassign */

const CUT_REGEXP = /^{%\s*cut\s*(["|'])(.*?)\1\s*%}/;

const tokenize: ParserInline.RuleInline = function (state, silent) {
  const pos = state.pos;
  const max = state.posMax;

  if (pos + 2 > max) return false;
  if (state.src.charAt(pos) !== '{') return false;
  if (state.src.charAt(pos + 1) !== '%') return false;

  const fragment = state.src.slice(pos);
  const m = fragment.match(/^\{%(.+?)%}/);
  if (!m) {
    return false;
  }
  const [raw, statement] = m;

  const statementTrimmed = statement.trim();
  if (!/^(cut|endcut)/.test(statementTrimmed)) {
    return false;
  }

  if (!silent) {
    if (/^cut/.test(statementTrimmed)) {
      const cutM = fragment.match(CUT_REGEXP);
      if (!cutM) {
        throw new Error('Cut match error');
      }
      const [, quote, title] = cutM;

      const token = state.push('cut_open_tag', '', 0);
      token.content = raw;
      token.children = [];

      const quoteOpenToken = new Token('cut_quote_open', '', 0);
      quoteOpenToken.content = quote;
      token.children.push(quoteOpenToken);

      state.md.inline.parse(title, state.md, state.env, token.children);

      const quoteCloseToken = new Token('cut_quote_close', '', 0);
      quoteCloseToken.content = quote;
      token.children.push(quoteCloseToken);
    } else {
      const token = state.push('cut_close_tag', '', 0);
      token.content = raw;
    }
  }

  state.pos += raw.length;
  return true;
};

export function cut(md: MarkdownIt) {
  md.inline.ruler.before('backticks', 'cut', tokenize);
}
