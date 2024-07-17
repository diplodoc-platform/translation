import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';

/* eslint-disable no-param-reassign */

/**
 * This is same plugin [markdown-it-sup](https://github.com/markdown-it/markdown-it-sup/blob/7a644d5276afa0229b569a8e8b789aa6f6325c1d/index.mjs)
 * (rev 7a644d5), just without content escape
 */

const tokenize: ParserInline.RuleInline = function (state, silent) {
  const max = state.posMax;
  const start = state.pos;

  if (state.src.charCodeAt(start) !== 0x5e /* ^ */) {
    return false;
  }
  if (silent) {
    return false;
  } // don't run any pairs in validation mode
  if (start + 2 >= max) {
    return false;
  }

  state.pos = start + 1;
  let found = false;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x5e /* ^ */) {
      found = true;
      break;
    }

    state.md.inline.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  const content = state.src.slice(start + 1, state.pos);

  // don't allow unescaped spaces/newlines inside
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 1;

  // Earlier we checked !silent, but this implementation does not need it
  const tokenSo = state.push('sup_open', 'sup', 1);
  tokenSo.markup = '^';

  const tokenT = state.push('text', '', 0);
  tokenT.content = content;

  const tokenSc = state.push('sup_close', 'sup', -1);
  tokenSc.markup = '^';

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
};

export function sup(md: MarkdownIt) {
  md.inline.ruler.after('emphasis', 'sup', tokenize);
}
