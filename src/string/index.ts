function replaceAfter(source: string, replacee: string, replacement: string, after = 0) {
    let cursor = after;
    let replaced = source.slice(0, after);

    replaced += source.slice(after).replace(replacee, function (match, offset) {
        cursor = offset + replacement.length + 1;

        return replacement;
    });

    return {replaced, cursor, success: cursor !== after};
}

export {replaceAfter};
export default {replaceAfter};
