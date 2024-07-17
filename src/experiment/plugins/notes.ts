import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';
import Token from 'markdown-it/lib/token';

/* eslint-disable no-param-reassign */

const NOTES_RE = /^{% note (alert|info|tip|warning)\s*(?:"(.*?)")? %}/;

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
  if (!/^(note|endnote)/.test(statementTrimmed)) {
    return false;
  }

  if (!silent) {
    if (/^note/.test(statementTrimmed)) {
      const noteM = fragment.match(NOTES_RE);
      if (!noteM) {
        throw new Error('Note match error');
      }
      const [, noteType, title] = noteM;

      const token = state.push('note_open_tag', '', 0);
      token.content = raw;
      token.children = [];

      const typeToken = new Token('note_type', '', 0);
      typeToken.content = noteType;
      token.children.push(typeToken);

      if (title) {
        const quoteOpenToken = new Token('note_quote_open', '', 0);
        quoteOpenToken.content = '"';
        token.children.push(quoteOpenToken);

        state.md.inline.parse(title, state.md, state.env, token.children);

        const quoteCloseToken = new Token('note_quote_close', '', 0);
        quoteOpenToken.content = '"';
        token.children.push(quoteCloseToken);
      }
    } else {
      const token = state.push('note_close_tag', '', 0);
      token.content = raw;
    }
  }

  state.pos += raw.length;
  return true;
};

export function note(md: MarkdownIt) {
  md.inline.ruler.before('backticks', 'note', tokenize);
}
