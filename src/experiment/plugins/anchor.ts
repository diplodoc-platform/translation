import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';

/* eslint-disable no-param-reassign */

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
    if (!/^anchor/.test(statementTrimmed)) {
        return false;
    }

    if (!silent) {
        const token = state.push('anchor_statement', '', 0);
        token.content = raw;
    }

    state.pos += raw.length;
    return true;
};

export function anchor(md: MarkdownIt) {
    md.inline.ruler.before('backticks', 'anchor', tokenize);
}
