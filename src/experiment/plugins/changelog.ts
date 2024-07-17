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
    if (!/^(changelog|endchangelog)/.test(statementTrimmed)) {
        return false;
    }

    if (!silent) {
        if (/^changelog/.test(statementTrimmed)) {
            const token = state.push('changelog_open_tag', '', 0);
            token.content = raw;
        } else {
            const token = state.push('changelog_close_tag', '', 0);
            token.content = raw;
        }
    }

    state.pos += raw.length;
    return true;
};

export function changelog(md: MarkdownIt) {
    md.inline.ruler.before('backticks', 'changelog', tokenize);
}
