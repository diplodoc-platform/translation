import type {Range} from './lines';

import {hasLetters, lineTokens, lines} from './lines';

type Kind = 'sequence' | 'flowchart' | 'other';

// Single-label lines: group 1 is the prefix, group 2 the label.
// Lines come without trailing whitespace, so the label runs to the end.

// `title Text` in a diagram body, `title: Text` in the frontmatter.
const TITLE = /^(\s*title(?::\s*|\s+))(\S.*)$/;

const PARTICIPANT = /^(\s*(?:create\s+)?(?:participant|actor)\s+\S+\s+as\s+)(\S.*)$/;
const NOTE = /^(\s*[Nn]ote\s+(?:over|left\s+of|right\s+of)\s+[^:]*:\s*)(\S.*)$/;
const BLOCK = /^(\s*(?:loop|alt|else|opt|par|and|critical|option|break)\s+)(\S.*)$/;
const BOX = /^(\s*box\s+(?:(?:rgba?\([^)]*\)|transparent)\s+)?)(\S.*)$/;
const COLOR = /^(?:rgba?\([^)]*\)|transparent|[a-z]+)$/i;
// `A->>B: text`, `A-->>+B: text`, `A-xB: text`, `A-)B: text`, `A<<->>B: text`
const MESSAGE =
    /^(\s*[^\s:<>-]+\s*(?:<<)?-{1,2}(?:>>|>|[xX]|\))\s*(?:[+-]\s*)?[^\s:]+\s*:\s*)(\S.*)$/;

const STATEMENT = /^\s*(?:flowchart|graph|classDef|class|style|linkStyle|click|direction)\b/;
const SUBGRAPH = /^(\s*subgraph\s+[^\s[]+\s*\[\s*("?))(.+?)\2\s*\]$/;

type LabelRule = {
    rx: RegExp;
    /** Index of the label group. */
    text: number;
    /** Distance from the match start to the label. */
    offset: (match: RegExpExecArray) => number;
    /** Rejects a match that only looks like a label. */
    skip?: (text: string) => boolean;
};

// Labels that may repeat within a flowchart line, in order of appearance:
// node shapes `A[text]`, `A(text)`, `A{text}` with their doubled and mixed
// variants, the `A@{ shape: ..., label: "text" }` form, edge labels
// `-- text -->` and `-->|text|`.
const LABELS: LabelRule[] = [
    {
        rx: /@\{[^}]*?\blabel:\s*(["'])(.+?)\1/g,
        text: 2,
        offset: (match) => match[0].length - match[2].length - 1,
    },
    {
        rx: /([\p{L}\p{N}_]+)(\(\[|\[[[(/\\]?|\({0,2}\(|\{\{?|>)("?)(.+?)\3\s*(?:[\])/\\]?\]|\){0,2}\)|\]\)|\}\}?)/gu,
        text: 4,
        offset: (match) => match[1].length + match[2].length + match[3].length,
    },
    {
        rx: /(?:--|-\.|==)(\s*)([^\s\-.=|>].*?)\s*(?:-->|---|\.->|\.-|==>|===)/g,
        text: 2,
        offset: (match) => 2 + match[1].length,
        // `A --o B` and `A --x B` are circle and cross arrow heads, not labels.
        skip: (text) => /^[ox](?:\s|$)/.test(text),
    },
    {
        rx: /\|(\s*)("?)([^|\s][^|]*?)\2\s*\|/g,
        text: 3,
        offset: (match) => 1 + match[1].length + match[2].length,
    },
];

/**
 * Strips the quotes of a quoted label (`title "Text"`).
 */
function unquote(from: number, text: string): Range {
    const quoted = text.length > 2 && text.startsWith('"') && text.endsWith('"');

    return quoted ? [from + 1, from + text.length - 1] : [from, from + text.length];
}

function single(line: string, rules: RegExp[]): Range[] {
    for (const rule of rules) {
        const match = rule.exec(line);

        if (match) {
            return hasLetters(match[2]) ? [unquote(match[1].length, match[2])] : [];
        }
    }

    return [];
}

function sequence(line: string): Range[] {
    const box = BOX.exec(line);

    if (box && !COLOR.test(box[2])) {
        return single(line, [BOX]);
    }

    return single(line, [TITLE, PARTICIPANT, NOTE, BLOCK, MESSAGE]);
}

/**
 * Scans the line left to right, taking the earliest label of any kind each time.
 */
function labels(line: string): Range[] {
    const ranges: Range[] = [];

    let position = 0;
    while (position < line.length) {
        let found: {match: RegExpExecArray; rule: LabelRule} | undefined;

        for (const rule of LABELS) {
            rule.rx.lastIndex = position;
            const match = rule.rx.exec(line);

            if (match && (!found || match.index < found.match.index)) {
                found = {match, rule};
            }
        }

        if (!found) {
            break;
        }

        const {match, rule} = found;
        const text = match[rule.text];
        const from = match.index + rule.offset(match);

        if (hasLetters(text) && !rule.skip?.(text)) {
            ranges.push([from, from + text.length]);
        }

        position = match.index + match[0].length;
    }

    return ranges;
}

function flowchart(line: string): Range[] {
    if (STATEMENT.test(line)) {
        return [];
    }

    const subgraph = SUBGRAPH.exec(line);

    if (subgraph) {
        const from = subgraph[1].length;

        return hasLetters(subgraph[3]) ? [[from, from + subgraph[3].length]] : [];
    }

    return labels(line);
}

const extractors: Record<Kind, (line: string) => Range[]> = {
    sequence,
    flowchart,
    other: (line) => single(line, [TITLE]),
};

function detect(header: string): Kind {
    if (/^sequenceDiagram\b/.test(header)) {
        return 'sequence';
    }

    if (/^(?:flowchart|graph)\b/.test(header)) {
        return 'flowchart';
    }

    return 'other';
}

type State = {
    kind?: Kind;
    frontmatter: boolean;
    directive: boolean;
};

/**
 * Classifies a line that carries no labels of the diagram body: frontmatter
 * (only its title is text), `%%{init}%%` directives spanning several lines,
 * comments, blank lines and the header naming the diagram kind.
 * Returns the ranges to extract, or null when the line belongs to the body.
 */
function preamble(state: State, line: string, index: number): Range[] | null {
    const trimmed = line.trim();

    if (index === 0 && trimmed === '---') {
        state.frontmatter = true;
        return [];
    }

    if (state.frontmatter) {
        state.frontmatter = trimmed !== '---';
        return state.frontmatter ? single(line, [TITLE]) : [];
    }

    if (state.directive) {
        state.directive = !trimmed.includes('}%%');
        return [];
    }

    if (trimmed.startsWith('%%')) {
        state.directive = trimmed.startsWith('%%{') && !trimmed.includes('}%%');
        return [];
    }

    if (!trimmed) {
        return [];
    }

    if (!state.kind) {
        state.kind = detect(trimmed);
        return [];
    }

    return null;
}

/**
 * Exposes human-readable labels of a mermaid diagram: notes, messages and aliases
 * of sequence diagrams, node and edge labels of flowcharts, and the title of any diagram.
 * Identifiers, directives (`%%{init}%%`), comments and styling stay untouched.
 */
export function* mermaid(content: string): Generator<Token> {
    const state: State = {frontmatter: false, directive: false};

    for (const [index, line] of lines(content).entries()) {
        const ranges = preamble(state, line, index) ?? extractors[state.kind as Kind](line);

        yield* lineTokens(line, ranges);
    }
}
