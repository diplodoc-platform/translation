import MdIt from 'markdown-it';

const md = new MdIt();
const state = new md.core.State('', md, {});

export function token(type: string, props: Hash = {}) {
    return Object.assign(new state.Token(type, '', 0), props);
}

export function find(type: string, tokens: Token[], idx: number) {
    while (tokens.length > idx) {
        if (tokens[idx].type === type) {
            return tokens[idx];
        }
        idx++;
    }

    return null;
}

export function replace(source: string, units: string[]): [string, boolean] {
    let matched = false;

    const result = source.replace(/%%%(\d+)%%%/g, (_, id: string | number) => {
        matched = true;
        id = Number(id);

        if (!units[id]) {
            throw new Error(`Translation token not found. Token id: ${id}`);
        }

        let [value, submatch] = replace(units[id], units);
        while (submatch) {
            [value, submatch] = replace(value, units);
        }

        return value;
    });

    return [result, matched];
}
