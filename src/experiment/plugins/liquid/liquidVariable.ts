import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';

import {FragmentType} from './constants';

/* eslint-disable no-param-reassign */

const tokenize: ParserInline.RuleInline = function (state, silent) {
  const pos = state.pos;
  const max = state.posMax;

  if (pos + 2 > max) return false;
  if (state.src.charAt(pos) !== '{') return false;
  if (state.src.charAt(pos + 1) !== '{') return false;

  const fragment = state.src.slice(pos);
  const m = fragment.match(/^\{\{.+?}}/);
  if (!m) {
    return false;
  }
  const [raw] = m;

  if (state.src.slice(pos - 7, pos) === 'not_var') {
    return false;
  }

  if (!silent) {
    const token = state.push(`liquid_${FragmentType.Variable}`, '', 0);
    token.content = raw;
  }

  state.pos += raw.length;
  return true;
};

export function liquidVariable(md: MarkdownIt) {
  md.inline.ruler.before('backticks', 'liquidVariable', tokenize);
}
