import MarkdownIt from 'markdown-it';

/* eslint-disable no-param-reassign */

const NOTES_RE = /^{% note (alert|info|tip|warning)\s*(?:"(.*?)")? %}/;

const tokenize: Parameters<MarkdownIt.MarkdownIt['inline']['ruler']['push']>[1] = function (
    state,
    silent,
) {
    const pos = state.pos;
    const max = state.posMax;

    if (pos + 2 > max) {
        return false;
    }
    if (!state.src.startsWith('{%', pos)) {
        return false;
    }

    const fragment = state.src.slice(pos);
    const m = /^\{%(.+?)%}/.exec(fragment);
    if (!m) {
        return false;
    }
    const [raw, statement] = m;

    const statementTrimmed = statement.trim();
    if (!statementTrimmed.startsWith('note') && !statementTrimmed.startsWith('endnote')) {
        return false;
    }

    if (!silent) {
        if (statementTrimmed.startsWith('note')) {
            const noteM = NOTES_RE.exec(fragment);
            if (!noteM) {
                throw new Error('Note match error');
            }
            const [, noteType, title] = noteM;

            const token = state.push('note_open_tag', '', 0);
            token.content = raw;
            token.children = [];

            const typeToken = new MarkdownIt.Token('note_type', '', 0);
            typeToken.content = noteType;
            token.children.push(typeToken);

            if (title) {
                const quoteOpenToken = new MarkdownIt.Token('note_quote_open', '', 0);
                quoteOpenToken.content = '"';
                token.children.push(quoteOpenToken);

                state.md.inline.parse(title, state.md, state.env, token.children);

                const quoteCloseToken = new MarkdownIt.Token('note_quote_close', '', 0);
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

export function note(md: MarkdownIt.MarkdownIt) {
    md.inline.ruler.before('backticks', 'note', tokenize);
}
