import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';

/* eslint-disable no-param-reassign */

const EMBED_REGEX = /^@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*[)]/i;

const tokenize: ParserInline.RuleInline = function (state, silent) {
  const pos = state.pos;
  const max = state.posMax;

  if (pos + 2 > max) return false;
  if (state.src.charAt(pos) !== '@') return false;
  if (state.src.charAt(pos + 1) !== '[') return false;

  const fragment = state.src.slice(pos);
  const m = fragment.match(EMBED_REGEX);
  if (!m) {
    return false;
  }
  const [raw] = m;

  if (!silent) {
    const token = state.push('video', '', 0);
    token.content = raw;
  }

  state.pos += raw.length;
  return true;
};

export function video(md: MarkdownIt) {
  md.inline.ruler.before('backticks', 'video', tokenize);
}
