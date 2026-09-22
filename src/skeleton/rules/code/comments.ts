import type {Range} from './lines';
import type {Literals} from './literals';

import {hasLetters, lineTokens, lines} from './lines';
import {
    CLIKE,
    CommentScanner,
    DOUBLE,
    GO,
    LUA,
    PERL,
    PHP,
    PLAIN,
    PYTHON,
    RUBY,
    RUST,
    SHELL,
    SQL,
    TOML,
    YAML,
} from './literals';

export type CodeHandler = (content: string) => Generator<Token>;

/**
 * What an angle-bracket word means in a language: a placeholder (`any`), a placeholder
 * only when it reads as prose because bare words are generics (`prose`), or a tag (`none`).
 */
export type Placeholders = 'any' | 'prose' | 'none';

export type CodeSyntax = {
    /**
     * Line comment marker. It counts only at line start or after whitespace,
     * so `"#fff"`, `https://` and `a--b` stay code.
     */
    comment?: RegExp;
    placeholders: Placeholders;
    literals: Literals;
};

const HASH = /(?<=^|\s)#+/;
const SLASHES = /(?<=^|\s)\/\/+/;
const DASHES = /(?<=^|\s)--+/;
const HASH_OR_SLASHES = /(?<=^|\s)(?:#+|\/\/+)/;
const HASH_OR_SEMICOLON = /(?<=^|\s)(?:#+|;+)/;

function define(
    comment: RegExp | undefined,
    placeholders: Placeholders,
    literals: Literals,
): CodeSyntax {
    return {comment, placeholders, literals};
}

const shell = define(HASH, 'any', SHELL);
const yaml = define(HASH, 'any', YAML);
const python = define(HASH, 'any', PYTHON);
const hash = define(HASH, 'any', PLAIN);
const toml = define(HASH, 'any', TOML);
const ruby = define(HASH, 'any', RUBY);
const perl = define(HASH, 'any', PERL);
const ini = define(HASH_OR_SEMICOLON, 'any', PLAIN);
const hcl = define(HASH_OR_SLASHES, 'any', PLAIN);
const php = define(HASH_OR_SLASHES, 'none', PHP);
const script = define(SLASHES, 'any', CLIKE);
// Angle brackets of typed languages are generics (`List<T>`) unless they read as prose.
const typed = define(SLASHES, 'prose', CLIKE);
const go = define(SLASHES, 'any', GO);
const rust = define(SLASHES, 'prose', RUST);
// JSX tags are markup, not placeholders.
const jsx = define(SLASHES, 'none', CLIKE);
const slashes = define(SLASHES, 'any', PLAIN);
const sql = define(DASHES, 'any', SQL);
const yql = define(DASHES, 'prose', SQL);
const lua = define(DASHES, 'any', LUA);
const dashes = define(DASHES, 'any', DOUBLE);
const markup = define(undefined, 'none', PLAIN);
const plain = define(undefined, 'any', PLAIN);

const syntaxes: Record<string, CodeSyntax> = {
    bash: shell,
    shell,
    sh: shell,
    zsh: shell,
    fish: shell,
    ksh: shell,
    dockerfile: shell,
    docker: shell,
    yaml,
    yml: yaml,
    python,
    python3: python,
    py: python,
    py3: python,
    toml,
    ini,
    cfg: ini,
    conf: hash,
    properties: hash,
    nginx: hash,
    makefile: hash,
    cmake: hash,
    awk: hash,
    tcl: hash,
    ruby,
    rb: ruby,
    crystal: ruby,
    cr: ruby,
    perl,
    pl: perl,
    r: hash,
    julia: hash,
    jl: hash,
    nim: hash,
    elixir: hash,
    ex: hash,
    exs: hash,
    powershell: hash,
    ps1: hash,
    gitignore: hash,
    gitconfig: hash,
    dotenv: hash,
    env: hash,
    promql: hash,
    graphql: hash,
    gql: hash,
    hcl,
    terraform: hcl,
    tf: hcl,
    thrift: hcl,
    php,
    js: script,
    javascript: script,
    jsx,
    ts: typed,
    typescript: typed,
    tsx: jsx,
    go,
    golang: go,
    java: typed,
    c: typed,
    h: typed,
    cpp: typed,
    'c++': typed,
    cc: typed,
    hpp: typed,
    cs: typed,
    csharp: typed,
    'c#': typed,
    rust,
    rs: rust,
    proto: slashes,
    protobuf: slashes,
    kotlin: typed,
    kt: typed,
    swift: typed,
    scala: typed,
    dart: typed,
    groovy: typed,
    zig: typed,
    objc: typed,
    objectivec: typed,
    'objective-c': typed,
    cypher: slashes,
    jsonc: slashes,
    json5: slashes,
    sql,
    mysql: sql,
    postgresql: sql,
    postgres: sql,
    pgsql: sql,
    plsql: sql,
    sqlite: sql,
    tsql: sql,
    yql,
    clickhouse: yql,
    lua,
    haskell: dashes,
    hs: dashes,
    elm: dashes,
    ada: dashes,
    html: markup,
    xhtml: markup,
    xml: markup,
    svg: markup,
    vue: markup,
    markdown: markup,
    md: markup,
};

/**
 * Comment, placeholder and literal conventions of a fence language.
 * Unknown languages expose placeholders only.
 */
export function codeSyntax(lang: string): CodeSyntax {
    return syntaxes[lang] ?? plain;
}

const DECORATION = ' \t-=*#>|~…';
const TRAILING = ' \t-=*#~|';
const ENUMERATOR = /^\d{1,3}[.)]\s+/;

const STARTS_WITH_WORD = /^[\p{L}\p{N}]/u;
const LIQUID = /\{\{.*?\}\}|\{%.*?%\}/g;
const PLACEHOLDER = /<[^<>]*>/g;
// `key: value`, `name=value`, `call(`
const KEY_OR_CALL = /^[a-z_$][\w$.\-[\]]*\s*[:=(]/;
const ASSIGNMENT = /\w=\S/;
const STATEMENT_END = /[;{}]$/;
const SINGLE_TOKEN = /^\S+$/;
const PATH_LIKE = /[_./:\\<>{}()]/;
// Statements and commands that people comment out, but that rarely start a sentence.
const FIRST_WORD = /^[\w.-]+/;
const KEYWORDS = new Set([
    'import',
    'def',
    'class',
    'const',
    'let',
    'var',
    'function',
    'func',
    'fn',
    'pub',
    'struct',
    'elif',
    'else',
    'return',
    'package',
    'namespace',
    'using',
    'require',
    'export',
    'echo',
    'sudo',
    'cd',
    'cat',
    'curl',
    'wget',
    'kubectl',
    'docker',
    'git',
    'npm',
    'yarn',
    'pip',
    'apt',
    'apt-get',
    'yt',
    'ya',
    'print',
    'println',
]);
const PYTHON_IMPORT = /^from\s+\S+\s+import\b/;
const SQL_STATEMENTS = [
    /^select\s.*\sfrom\s/i,
    /^insert\s+into\s/i,
    /^update\s+\S+\s+set\s/i,
    /^delete\s+from\s/i,
    /^create\s+(?:table|index|database|schema|view|or)\s/i,
    /^drop\s+(?:table|index|database|schema|view)\s/i,
    /^alter\s+table\s/i,
];
// Tool directives that live in comments.
const DIRECTIVE =
    /^(?:eslint-|prettier-|noqa\b|nolint\b|nosec\b|pylint\b|type:|fmt:|ts-|istanbul\b|c8\b|v8\b|noinspection\b|coding[:=]|vim:|emacs:)/i;

/**
 * Locates the comment text between decorations. A dot is a decoration only in a run (`...`).
 */
function core(text: string): Range {
    let from = 0;
    while (from < text.length) {
        const char = text[from];
        const dots = char === '.' && (text[from + 1] === '.' || text[from - 1] === '.');

        if (!DECORATION.includes(char) && !dots) {
            break;
        }

        from++;
    }

    // `# 1. Step` and `# 2) Step`: the enumerator stays in the skeleton.
    from += ENUMERATOR.exec(text.slice(from))?.[0].length ?? 0;

    let to = text.length;
    while (to > from && TRAILING.includes(text[to - 1])) {
        to--;
    }

    return [from, to];
}

/**
 * Tells a human-readable comment from commented-out code, directives and separators.
 *
 * The heuristic errs on the side of code: a skipped comment stays as is,
 * while a translated statement breaks the example once uncommented.
 */
export function isProse(text: string) {
    const [from, to] = core(text);
    const raw = text.slice(from, to);
    // Liquid variables and placeholders are opaque words for the checks below.
    const comment = raw.replace(LIQUID, 'v').replace(PLACEHOLDER, 'v');

    if (!hasLetters(comment) || !STARTS_WITH_WORD.test(comment)) {
        return false;
    }

    if (KEY_OR_CALL.test(comment) || ASSIGNMENT.test(comment) || STATEMENT_END.test(comment)) {
        return false;
    }

    // A lone word with a colon (`Например:`) is prose, a lone path, type or placeholder is not.
    if (SINGLE_TOKEN.test(comment) && PATH_LIKE.test(raw.replace(/:$/, ''))) {
        return false;
    }

    const word = FIRST_WORD.exec(comment)?.[0] ?? '';

    return (
        !KEYWORDS.has(word) &&
        !PYTHON_IMPORT.test(comment) &&
        !SQL_STATEMENTS.some((statement) => statement.test(comment)) &&
        !DIRECTIVE.test(comment)
    );
}

// A placeholder starts with a letter and has no whitespace at its edges,
// which tells `<your token>` from `a < b && c > d`.
const WORDLIKE = /^\p{L}(?:[^<>]*[^\s<>])?$/u;
// Generics never carry non-ASCII letters; a placeholder of several ASCII words
// is prose too, unless it looks like a type list (`a:Int32`, `K, V`).
const NON_ASCII = /\P{ASCII}/u;
const SEVERAL_WORDS = /[\s-]/;
const TYPE_LIST = /[:,]/;

function isPlaceholder(text: string, mode: Placeholders) {
    if (mode === 'none' || !WORDLIKE.test(text)) {
        return false;
    }

    if (mode === 'any' || NON_ASCII.test(text)) {
        return true;
    }

    return SEVERAL_WORDS.test(text) && !TYPE_LIST.test(text);
}

/**
 * Angle-bracket placeholders (`<your token>`) inside `line` between `from` and `to`.
 */
function placeholderRanges(line: string, from: number, to: number, mode: Placeholders): Range[] {
    const ranges: Range[] = [];

    for (const match of line.slice(from, to).matchAll(/<([^<>]*)>/g)) {
        if (isPlaceholder(match[1], mode)) {
            const start = from + match.index + 1;

            ranges.push([start, start + match[1].length]);
        }
    }

    return ranges;
}

/**
 * Exposes placeholders from code and the text of line comments,
 * leaving commented-out code with its placeholders only.
 */
export function comments(syntax: CodeSyntax): CodeHandler {
    return function* (content: string) {
        const scanner = new CommentScanner(syntax.comment, syntax.literals);

        for (const line of lines(content)) {
            const marker = scanner.comment(line);
            const codeEnd = marker ? marker.index : line.length;
            const ranges = placeholderRanges(line, 0, codeEnd, syntax.placeholders);

            if (marker) {
                const start = marker.index + marker.length;
                const comment = line.slice(start);

                if (isProse(comment)) {
                    const [from, to] = core(comment);

                    ranges.push([start + from, start + to]);
                } else {
                    ranges.push(
                        ...placeholderRanges(line, start, line.length, syntax.placeholders),
                    );
                }
            }

            yield* lineTokens(line, ranges);
        }
    };
}
