import MarkdownIt from 'markdown-it';
import ParserInline from 'markdown-it/lib/parser_inline';

/* eslint-disable no-param-reassign */

const getCloseCharPos = (fragment: string) => {
    let level = 0;
    for (let i = 0, len = fragment.length; i < len; i++) {
        const char = fragment.charAt(i);
        if (char === '{') {
            level++;
            continue;
        }
        if (char === '}') {
            level--;
        }
        if (level === 0) {
            return i;
        }
    }
    return -1;
};

const tokenize: ParserInline.RuleInline = function (state, silent) {
    const pos = state.pos;
    const max = state.posMax;

    if (pos + 2 > max) return false;
    if (state.src.charAt(pos) !== '{') return false;

    const fragment = state.src.slice(pos);

    const closePos = getCloseCharPos(fragment);
    if (closePos === -1 || closePos === 1) {
        return false;
    }

    const raw = fragment.slice(0, closePos + 1);
    let text;
    if (fragment.slice(0, 2) === '{{') {
        text = fragment.slice(2, closePos - 1);
    } else {
        text = fragment.slice(1, closePos);
    }

    if (!silent) {
        const token = state.push(`xliff_special`, '', 0);
        token.content = raw;
        token.children = [];

        state.md.inline.parse(text, state.md, state.env, token.children);
    }

    state.pos += raw.length;
    return true;
};

export function xliffSpecial(md: MarkdownIt) {
    md.inline.ruler.before('backticks', 'xliffSpecial', tokenize);
}
