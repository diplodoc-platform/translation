/**
 * String literal conventions of a fence language: enough to tell a comment
 * marker inside a literal from a real comment without a full lexer.
 */
export type Literals = {
    /** Quote characters that delimit literals. */
    quotes: string;
    /** Quotes whose literals may span lines. */
    multiline: string;
    /** Quotes where a backslash escapes the next character. */
    escapes: string;
    /** `"""` and `'''` open multi-line literals. */
    triple?: boolean;
    /** Heredoc operator; the second group is the terminator word. */
    heredoc?: RegExp;
    /** Yaml block scalars (`key: |`): the indented lines below are one literal. */
    blockScalars?: boolean;
};

export const CLIKE: Literals = {quotes: '\'"`', multiline: '`', escapes: '\'"`', triple: true};
export const GO: Literals = {quotes: '\'"`', multiline: '`', escapes: '\'"'};
export const RUST: Literals = {quotes: '\'"', multiline: '"', escapes: '\'"'};
export const SHELL: Literals = {
    quotes: '\'"`',
    multiline: '\'"`',
    escapes: '"`',
    heredoc: /<<-?\s*(['"]?)([A-Za-z_]\w*)\1/,
};
export const YAML: Literals = {quotes: '\'"', multiline: '\'"', escapes: '"', blockScalars: true};
export const PYTHON: Literals = {quotes: '\'"', multiline: '', escapes: '\'"', triple: true};
export const SQL: Literals = {quotes: '\'"`', multiline: '\'"', escapes: '\'"'};
export const RUBY: Literals = {
    quotes: '\'"`',
    multiline: '\'"',
    escapes: '"`',
    heredoc: /<<[-~]?(['"]?)([A-Za-z_]\w*)\1/,
};
export const PERL: Literals = {quotes: '\'"`', multiline: '\'"', escapes: '"`'};
export const PHP: Literals = {
    quotes: '\'"`',
    multiline: '\'"',
    escapes: '\'"',
    heredoc: /<<<\s*(['"]?)([A-Za-z_]\w*)\1/,
};
export const LUA: Literals = {quotes: '\'"', multiline: '', escapes: '\'"'};
/** Haskell, Elm, Ada: `'` is a prime or a character, `"` a one-line string. */
export const DOUBLE: Literals = {quotes: '"', multiline: '', escapes: '"'};
export const TOML: Literals = {quotes: '\'"', multiline: '', escapes: '"', triple: true};
/** Configs and the rest: one-line strings in either quote. */
export const PLAIN: Literals = {quotes: '\'"', multiline: '', escapes: '\'"', triple: true};

export type Marker = {index: number; length: number};

// Where a literal may start when its end is not on the same line: after
// whitespace, an operator or a bracket. A template tag (html`...`) is a word.
const LITERAL_START = /[\s=(,:[{+>?!&|;]/;
const TAG = /[\p{L}\p{N})\]]/u;
const WORD_CHAR = /[\p{L}\p{N}_]/u;
// `f'...'`, `rb"..."`, `E'...'`, `N'...'`: a quote after these letters is a literal, not an apostrophe.
const PREFIX = /(?:^|[^\p{L}\p{N}_])[fFrRbBuUeEnNxX]{1,2}$/u;
// `key: |`, `- >-`, `key: |2`: the indented lines below are one string.
const BLOCK_SCALAR = /(?:^|:|-)\s*[|>][-+0-9]*\s*$/;

/**
 * Finds comment markers outside string literals. Literals may span lines
 * (template strings, docstrings, shell and sql strings, heredocs, yaml block
 * scalars), so the scanner keeps its state for the whole block.
 */
export class CommentScanner {
    private readonly marker: RegExp | undefined;

    private readonly literals: Literals;

    /** Delimiter of the open literal: a quote, a backtick or a triple quote. */
    private quote = '';

    private heredoc: string | null = null;

    /** Indent of the yaml line that opened a block scalar. */
    private block: number | null = null;

    constructor(marker: RegExp | undefined, literals: Literals) {
        this.marker = marker && new RegExp(marker.source, 'g');
        this.literals = literals;
    }

    /**
     * The comment marker of the line, or null when the line has none
     * or is a literal as a whole.
     */
    comment(line: string): Marker | null {
        if (this.insideHeredoc(line) || this.insideBlockScalar(line)) {
            return null;
        }

        const {marker, code} = this.scan(line);

        this.openBlockScalar(code);
        this.openHeredoc(line.slice(0, code.length), code);
        this.endLine();

        return marker;
    }

    /**
     * Walks the line up to the first marker outside literals. Returns the
     * marker and the code before it with literal characters blanked out.
     */
    private scan(line: string): {marker: Marker | null; code: string} {
        const candidates = this.marker ? [...line.matchAll(this.marker)] : [];
        const code: string[] = [];

        for (let index = 0; index < line.length; index++) {
            if (this.quote) {
                const end = this.closeLiteral(line, index);

                code.push('x'.repeat(end - index + 1));
                index = end;
                continue;
            }

            while (candidates.length && (candidates[0].index as number) < index) {
                candidates.shift();
            }

            if (candidates.length && candidates[0].index === index) {
                return {marker: {index, length: candidates[0][0].length}, code: code.join('')};
            }

            const end = this.openLiteral(line, index);

            code.push(this.quote ? 'x'.repeat(end - index + 1) : line[index]);
            index = end;
        }

        return {marker: null, code: code.join('')};
    }

    /**
     * Inside a literal: skips an escaped or doubled quote, or closes the literal.
     * Returns the last consumed index.
     */
    private closeLiteral(line: string, index: number): number {
        const char = line[index];

        if (char === '\\' && this.literals.escapes.includes(this.quote[0])) {
            return Math.min(index + 1, line.length - 1);
        }

        if (!line.startsWith(this.quote, index)) {
            return index;
        }

        // A doubled quote is an escaped quote (sql, yaml) or an adjacent
        // literal (shell, python): the literal goes on either way.
        if (this.quote.length === 1 && this.quote !== '`' && line[index + 1] === this.quote) {
            return index + 1;
        }

        const end = index + this.quote.length - 1;

        this.quote = '';

        return end;
    }

    /**
     * Outside a literal: opens one at a quote that starts a literal.
     * Returns the last consumed index.
     */
    private openLiteral(line: string, index: number): number {
        const char = line[index];

        if (!this.literals.quotes.includes(char)) {
            return index;
        }

        if (this.literals.triple && char !== '`' && line.startsWith(char.repeat(3), index)) {
            this.quote = char.repeat(3);

            return index + 2;
        }

        if (this.opens(line, index)) {
            this.quote = char;
        }

        return index;
    }

    /**
     * Whether the quote at `index` starts a literal. An apostrophe inside or
     * after a word (`don't`, `users'`) does not, unless the word is a literal
     * prefix (`f'...'`); a one-line apostrophe literal must also end on the
     * line, or it is a lifetime (`&'a str`). Any other quote that does not end
     * on the line must begin where a literal may, otherwise it is an inch mark.
     */
    private opens(line: string, index: number): boolean {
        const char = line[index];
        const previous = line[index - 1] ?? '';
        const closes = line.indexOf(char, index + 1) !== -1;
        const spans = this.literals.multiline.includes(char);

        if (char === "'") {
            const apostrophe = WORD_CHAR.test(previous) && !PREFIX.test(line.slice(0, index));

            if (apostrophe || (!closes && !spans)) {
                return false;
            }
        }

        if (closes) {
            return true;
        }

        return index === 0 || LITERAL_START.test(previous) || (char === '`' && TAG.test(previous));
    }

    /**
     * A one-line literal does not survive its line: an unterminated one is a
     * typo or a continuation, not a reason to hide the comments below.
     */
    private endLine() {
        if (this.quote.length === 1 && !this.literals.multiline.includes(this.quote)) {
            this.quote = '';
        }
    }

    /**
     * The terminator is read from the raw code (`<<'EOF'` quotes it), the
     * masked code tells an operator from `"<<EOF"` inside a literal.
     */
    private openHeredoc(raw: string, masked: string) {
        const match = this.literals.heredoc?.exec(raw);

        if (match && masked[match.index] === '<') {
            this.heredoc = match[2];
        }
    }

    private insideHeredoc(line: string): boolean {
        if (this.heredoc === null) {
            return false;
        }

        if (line.trim().replace(/;$/, '') === this.heredoc) {
            this.heredoc = null;
        }

        return true;
    }

    private openBlockScalar(code: string) {
        if (this.literals.blockScalars && BLOCK_SCALAR.test(code)) {
            this.block = code.length - code.trimStart().length;
        }
    }

    private insideBlockScalar(line: string): boolean {
        if (this.block === null) {
            return false;
        }

        const indent = line.length - line.trimStart().length;

        if (!line.trim() || indent > this.block) {
            return true;
        }

        this.block = null;

        return false;
    }
}
