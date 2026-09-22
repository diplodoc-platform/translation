import {gt, lt, qt, sl} from 'src/symbols';

import {snakeCase} from './utils';

export type GenerateXParams = {
    ctype: string;
    equivText: string;
} & {
    [prop: string]: string;
};

export function generateX(parameters: GenerateXParams) {
    parameters = {...parameters, ...id()};

    const props = Object.keys(parameters)
        .sort()
        .map((key) => `${snakeCase(key)}=${qt}${parameters[key]}${qt}`)
        .join(' ');

    return `${lt}x ${props}${sl + gt}`;
}

let ID = 1;

// Resets the `x-N` id sequence.
//
// Ids participate in unit texts (hence in translation cache and seed keys),
// so they restart for every extracted document, and for every unit when
// the `unitLocalIds` option is set - a counter shared by units makes a unit
// text depend on the markup extracted before it.
export function resetXIds() {
    ID = 1;
}

function id() {
    if (process.env.JEST_WORKER_ID) {
        return {id: 'g-test'};
    }

    return {id: 'x-' + ID++};
}
