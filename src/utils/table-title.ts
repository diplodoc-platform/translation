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
            if (result || value?.quoted === undefined) {
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
    const quoted: Record<string, RegExp> = {
        '"': /"((?:\\.|[^"\\])*)"/y,
        "'": /'((?:\\.|[^'\\])*)'/y,
    };
    const pattern = quoted[content[offset]] ?? /(?:\{\{\s*[\w.-]+\s*\}\}|[^\s{}"'=])+/y;
    pattern.lastIndex = offset;
    const match = pattern.exec(content);
    return match ? {end: pattern.lastIndex, quoted: match[1]} : undefined;
}

/**
 * Preserve existing escapes, but do not let translated text close the attribute.
 * @param text Fully composed title text.
 * @param quote Original attribute delimiter.
 * @returns Title text safe for the original delimiter.
 */
export function escapeTableTitle(text: string, quote: string): string {
    return text.replace(/(?:\\[\s\S]|["'])|(?:\\$)/g, (part) =>
        part === quote || part === '\\' ? '\\' + part : part,
    );
}

/**
 * Apply quote escaping only to replacements inside known Markdown title values.
 * @param source Markdown skeleton with translation placeholders.
 * @returns Context-aware replacement renderer.
 */
export function tableTitleEscaper(source: string) {
    const titles: {start: number; end: number; quote: string}[] = [];
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
                const [prefix, title, suffix] = parts;
                const start = line.index + from + prefix.length;
                titles.push({start, end: start + title.length, quote: suffix[0]});
            }
        }
    }
    return (value: string, offset: number) => {
        const title = titles.find(({start, end}) => offset >= start && offset < end);
        return title ? escapeTableTitle(value, title.quote) : value;
    };
}
