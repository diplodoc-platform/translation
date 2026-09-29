import {Liquid} from 'src/skeleton/liquid';

/**
 * Split a standalone wide-table attribute into its protected edges and title.
 * @param content Standalone attribute source.
 * @returns Protected prefix, title and suffix, or undefined for unsupported input.
 */
export function tableTitleParts(content: string): [string, string, string] | undefined {
    const opening = /^[ \t]*\{wide-content/.exec(content);
    if (!opening || !content.endsWith('}') || /[\r\n]/.test(content)) {
        return undefined;
    }
    // Scan complete attributes: `title=` inside another value and `data-title`
    // are not human-readable title fields.
    const attributes = /[ \t]+([.#]?[\w-]+)([ \t]*=[ \t]*)?/y;
    let cursor = opening[0].length;
    let result: [string, string, string] | undefined;
    while (content.slice(cursor, -1).trim()) {
        attributes.lastIndex = cursor;
        const attribute = attributes.exec(content);
        if (!attribute) {
            return undefined;
        }
        cursor = attributes.lastIndex;
        const value = attribute[2] ? attributeValue(content, cursor) : undefined;
        if (attribute[2] && !value) {
            return undefined;
        }
        cursor = value?.end ?? cursor;
        if (attribute[1] === 'title') {
            if (result || value?.quoted === undefined || unsafeTitle(value.quoted)) {
                return undefined;
            }
            const start = cursor - value.quoted.length - 1;
            result = [content.slice(0, start), value.quoted, content.slice(cursor - 1)];
        }
    }
    return result;
}

/**
 * Scan a single value separately from the attribute name and assignment.
 * @param content Standalone attribute source.
 * @param offset Start of the value.
 * @returns End offset and quoted contents, or undefined for invalid values.
 */
function attributeValue(content: string, offset: number) {
    // markdown-it-attrs only quotes values with double quotes. Backslashes
    // are literal characters, not an escape mechanism.
    const pattern =
        content[offset] === '"' ? /"([^"]*)"/y : /(?:\{\{\s*[\w.-]+\s*\}\}|[^\s{}"'=])+/y;
    pattern.lastIndex = offset;
    const match = pattern.exec(content);
    return match ? {end: pattern.lastIndex, quoted: match[1]} : undefined;
}

/**
 * Check delimiters the downstream attribute parser cannot represent literally.
 * @param text Fully composed title text.
 * @returns Whether the title would close the value or attribute prematurely.
 */
function unsafeTitle(text: string): boolean {
    // Variables are substituted before YFM rendering, not literal braces.
    // Use the extraction tokenizer so filters/functions are protected too.
    return (
        /[\r\n]/.test(text) ||
        new Liquid(text).tokenize().some((token) => {
            if (['Variable', 'Filter', 'Function'].includes(token.subtype)) return false;
            return /["}]/.test(token.content || token.markup || '');
        })
    );
}

/**
 * Locate title values in the raw skeleton, retaining container offsets.
 * @param source Markdown skeleton with translation placeholders.
 * @returns Half-open title ranges.
 */
function titleRanges(source: string) {
    const titles: {start: number; end: number}[] = [];
    if (source.includes('{wide-content')) {
        for (const line of source.matchAll(/^.*$/gm)) {
            // Markdown strips container prefixes and trailing spaces before
            // the extraction hook sees inline content. They remain in the
            // skeleton; retain their offsets without treating them as attrs.
            const from = line[0].indexOf('{wide-content');
            if (from < 0) {
                continue;
            }
            const parts = tableTitleParts(line[0].slice(from).trimEnd());
            if (parts) {
                const [prefix, title] = parts;
                const start = line.index + from + prefix.length;
                titles.push({start, end: start + title.length});
            }
        }
    }
    return titles;
}

/**
 * Identify units that need title-specific validation, including nested units.
 * @param source Markdown skeleton.
 * @param units Extracted XLIFF source units.
 * @returns One group of unit indices per title value.
 */
export function tableTitleUnitIds(source: string, units: string[]): number[][] {
    const visit = (text: string, ids: Set<number>) => {
        for (const match of text.matchAll(/%%%(\d+)%%%/g)) {
            const id = Number(match[1]);
            if (!ids.has(id)) {
                ids.add(id);
                visit(units[id] || '', ids);
            }
        }
    };
    return titleRanges(source)
        .map(({start, end}) => {
            const ids = new Set<number>();
            visit(source.slice(start, end), ids);
            return [...ids];
        })
        .filter((ids) => ids.length);
}

/**
 * Reject unrepresentable translated titles; never pretend backslashes escape YFM.
 * @param source Markdown skeleton.
 * @returns Context-aware replacement validator.
 */
export function tableTitleValidator(source: string) {
    const titles = titleRanges(source);
    return (value: string, offset: number) => {
        if (titles.some(({start, end}) => offset >= start && offset < end) && unsafeTitle(value)) {
            throw new Error(
                'Invalid wide-table title: double quotes, closing braces and line breaks cannot be represented in YFM attributes.',
            );
        }
        return value;
    };
}
