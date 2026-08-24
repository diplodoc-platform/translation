import {gt, lt, qt, sl} from 'src/symbols';

import {snakeCase} from './utils';

export type OpenGParams = {
    ctype: string;
    equivText: string;
    xBegin: string;
    xEnd: string;
} & {
    [prop: string]: string;
};

export function generateOpenG(parameters: OpenGParams): string {
    parameters = {...parameters, ...id()};

    const props = Object.keys(parameters)
        .sort()
        .map((key) => `${snakeCase(key)}=${qt}${parameters[key]}${qt}`)
        .join(' ');

    return `${lt}g ${props}${gt}`;
}

export function generateCloseG(): string {
    return `${lt}${sl}g${gt}`;
}

let ID = 1;

/** Resets the `g-N` id sequence (see resetXIds for the rationale). */
export function resetGIds() {
    ID = 1;
}

function id() {
    if (process.env.JEST_WORKER_ID) {
        return {id: 'g-test'};
    }

    return {id: 'g-' + ID++};
}
