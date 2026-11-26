/**
 * Preserve authored escapes while making a translated body valid for markdown-it-sub 2.0.0.
 * @param body Source-derived subscript body from a translation unit.
 * @returns The body with required delimiter and space escapes.
 */
export function escapeSubscriptBody(body: string) {
    let escaped = '';
    let slashes = 0;

    for (const char of body) {
        if (char === '\\') {
            escaped += char;
            slashes++;
            continue;
        }

        if (slashes % 2 === 0) {
            if (char === ' ' || char === '~') {
                escaped += '\\';
            } else if (/\s/u.test(char)) {
                throw new Error('Subscript target contains unsupported whitespace');
            }
        }
        escaped += char;
        slashes = 0;
    }

    // An unmatched terminal slash would escape the real closing delimiter.
    return escaped + (slashes % 2 ? '\\' : '');
}
