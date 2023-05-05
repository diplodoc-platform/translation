function traverse(
    meta: Record<string, unknown>,
    fn: (val: string, path: string[]) => string,
    path = new Array<string>(),
) {
    for (const [key, val] of Object.entries(meta)) {
        const newpath = [...path, key];

        if (typeof val === 'string') {
            meta[key] = fn(val, newpath) ?? val;
        } else if (isObjectOrArray(val)) {
            traverse(val, fn, newpath);
        }
    }
}

function isObjectOrArray(obj: unknown): obj is Record<string, unknown> {
    const type = Object.prototype.toString.call(obj);

    return type === '[object Object]' || type === '[object Array]';
}

export {traverse};
export default {traverse};
