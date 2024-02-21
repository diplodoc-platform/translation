import MdIt from 'markdown-it';

const md = new MdIt();
const state = new md.core.State('', md, {});

export function token(type: string, props: Record<string, any> = {}) {
    return Object.assign(new state.Token(type, '', 0), props);
}

export function replace(source: string, units: string[]): [string, boolean] {
    let matched = false;

    const result = source.replace(/%%%(\d+)%%%/g, (_, id: string | number) => {
        matched = true;
        id = Number(id);

        if (!units[id]) {
            throw new Error('Translation token not found.');
        }

        let [value, submatch] = replace(units[id], units);
        while (submatch) {
            [value, submatch] = replace(value, units);
        }

        return value;
    });

    return [result, matched];
}
