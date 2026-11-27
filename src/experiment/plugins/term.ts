import type {Env, MarkdownIt, ParserBlock, StateBlock, StateCore, Token} from 'markdown-it';

const getTermDefinitions = (md: MarkdownIt) => {
    const termDefinitions: Parameters<ParserBlock['ruler']['push']>[1] = function (
        this: MarkdownIt,
        state,
        startLine,
        endLine,
        silent,
    ) {
        let ch;
        let labelEnd;
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];

        if (pos + 2 >= max) {
            return false;
        }

        if (state.src.charCodeAt(pos++) !== 0x5b /* [ */) {
            return false;
        }
        if (state.src.charCodeAt(pos++) !== 0x2a /* * */) {
            return false;
        }

        const labelStart = pos;

        for (; pos < max; pos++) {
            ch = state.src.charCodeAt(pos);
            if (ch === 0x5b /* [ */) {
                return false;
            } else if (ch === 0x5d /* ] */) {
                labelEnd = pos;
                break;
            } else if (ch === 0x5c /* \ */) {
                pos++;
            }
        }

        const currentLine = scanTermDefinition(state, startLine, endLine);
        max = state.eMarks[currentLine];

        if (!labelEnd || labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3a /* : */) {
            return false;
        }

        if (silent) {
            return true;
        }

        const label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
        const title = state.src.slice(labelEnd + 2, max).trim();

        if (label.length === 0 || title.length === 0) {
            return false;
        }

        const rawLabel = state.src.slice(labelStart - 2, labelEnd + 2);
        const rawTitle = state.src.slice(labelEnd + 2, max);

        return processTermDefinition(md, state, currentLine, label, title, rawLabel, rawTitle);
    };

    return termDefinitions;
};

function scanTermDefinition(state: StateBlock, startLine: number, endLine: number) {
    const newLineReg = new RegExp(/^(\r\n|\r|\n)/);
    const termReg = new RegExp(/^\[\*(\w+)]:/);
    let currentLine = startLine;

    // Allow multiline term definition
    for (; currentLine < endLine; currentLine++) {
        const nextLineStart = state.bMarks[currentLine + 1];
        const nextLineEnd = state.eMarks[currentLine + 1];

        const nextLine =
            nextLineStart === nextLineEnd
                ? state.src[nextLineStart]
                : state.src.slice(nextLineStart, nextLineEnd);

        if (newLineReg.test(nextLine) || termReg.test(nextLine)) {
            break;
        }

        // eslint-disable-next-line no-param-reassign
        state.line = currentLine + 1;
    }

    return currentLine;
}

function processTermDefinition(
    md: MarkdownIt,
    state: StateBlock,
    currentLine: number,
    label: string,
    title: string,
    rawLabel: string,
    rawTitle: string,
) {
    const environment: Env & {terms?: Record<string, string>} = state.env;
    const terms = (environment.terms ??= {});
    const key = ':' + label;
    terms[key] ??= title;

    const termBlock = new state.Token('term_block', '', 0);
    state.tokens.push(termBlock);
    termBlock.children = [];
    termBlock.content = rawLabel + rawTitle;

    const termLabel = new state.Token('term_label', '', 0);
    termBlock.children.push(termLabel);
    termLabel.content = rawLabel;

    const termContent = new state.Token('term_content', '', 0);
    termBlock.children.push(termContent);
    termContent.content = rawTitle;
    termContent.children = md.parse(title, state.env);

    /** current line links to end of term definition */
    // eslint-disable-next-line no-param-reassign
    state.line = currentLine + 1;

    return true;
}

const getTermReplace = (md: MarkdownIt) => {
    const termReplace: Parameters<MarkdownIt['core']['ruler']['push']>[1] = function (
        state: StateCore,
    ) {
        const escapeRE = md.utils.escapeRE;
        const blockTokens = state.tokens;

        if (!state.env.terms) {
            return;
        }

        const regTerms = Object.keys(state.env.terms)
            .map((el) => el.slice(1))
            .map(escapeRE)
            .join('|');
        const regText = '\\[([^\\[]+)\\](\\(\\*(' + regTerms + ')\\))';
        const reg = new RegExp(regText, 'g');

        for (let j = 0, l = blockTokens.length; j < l; j++) {
            if (blockTokens[j].type === 'heading_open') {
                while (blockTokens[j].type !== 'heading_close') {
                    j++;
                }
                continue;
            }

            if (blockTokens[j].type !== 'inline') {
                continue;
            }

            blockTokens[j].children = replaceInlineTerms(
                md,
                state.Token,
                blockTokens[j].children as Token[],
                reg,
            );
        }
    };

    return termReplace;
};

function replaceInlineTerms(
    md: MarkdownIt,
    TokenClass: StateCore['Token'],
    tokens: Token[],
    pattern: RegExp,
) {
    let children = tokens;
    for (let i = children.length - 1; i >= 0; i--) {
        const current = children[i];
        if (current.type === 'link_close') {
            while (children[i].type !== 'link_open') {
                i--;
            }
            continue;
        }
        if (current.type !== 'text') {
            continue;
        }
        const parts = splitTermText(TokenClass, current.content, pattern);
        if (parts.length) {
            children = md.utils.arrayReplaceAt(children, i, parts);
        }
    }
    return children;
}

function splitTermText(TokenClass: StateCore['Token'], text: string, pattern: RegExp) {
    const parts: Token[] = [];
    let pos = 0;
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
        const [raw, title] = match;
        if (match.index > 0 || title.length > 0) {
            const preceding = new TokenClass('text', '', 0);
            preceding.content = text.slice(pos, match.index);
            parts.push(preceding);
        }

        const link = new TokenClass('term_link', '', 0);
        link.content = raw;
        const label = new TokenClass('text', '', 0);
        label.content = title;
        link.children = [label];
        parts.push(link);
        pos = pattern.lastIndex;
    }

    if (parts.length && pos < text.length) {
        const trailing = new TokenClass('text', '', 0);
        trailing.content = text.slice(pos);
        parts.push(trailing);
    }
    return parts;
}

export function term(md: MarkdownIt) {
    const defaultLinkValidation = md.validateLink;
    // eslint-disable-next-line no-param-reassign
    md.validateLink = function (url) {
        if (url.startsWith('*')) {
            return false;
        }

        return defaultLinkValidation(url);
    };

    md.block.ruler.before('reference', 'termDefinitions', getTermDefinitions(md), {
        alt: ['paragraph', 'reference'],
    });

    md.core.ruler.after('linkify', 'termReplace', getTermReplace(md));
}
