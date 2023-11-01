function normalizeSource(source: string[]) {
    return source.map((l) => l.replace(/\t/gmu, ' '.repeat(4)));
}

export {normalizeSource};
export default {normalizeSource};
