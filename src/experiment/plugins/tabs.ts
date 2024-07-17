import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';

/* eslint-disable no-param-reassign */

const TAB_RE = /^{% list tabs( group=([^ ]*))? %}/;

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
    if (!/^(list tabs|endlist)/.test(statementTrimmed)) {
        return false;
    }

    if (!silent) {
        if (/^list tabs/.test(statementTrimmed)) {
            const mLocal = fragment.match(TAB_RE);
            if (!mLocal) {
                throw new Error('Tabs match error');
            }

            const token = state.push('list_tabs_open_tag', '', 0);
            token.content = raw;
        } else {
            const token = state.push('list_tabs_close_tag', '', 0);
            token.content = raw;
        }
    }

    state.pos += raw.length;
    return true;
};

export function tabs(md: MarkdownIt) {
    md.inline.ruler.before('backticks', 'tabs', tokenize);
}
