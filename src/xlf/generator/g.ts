import {gt, lt, qt, sl} from 'src/xlf/symbols';

export type OpenGParams = {
    ctype: string;
    equivText: string;
};

export function generateOpenG(parameters: OpenGParams): string {
    const {ctype, equivText} = parameters;
    let rendered = `${lt}g`;

    if (ctype?.length) {
        rendered += ` ctype=${qt}x-${ctype}${qt}`;
    }

    if (equivText?.length) {
        rendered += ` equiv-text=${qt}${equivText}${qt}`;
    }

    rendered += `${gt}`;

    return rendered;
}

export function generateCloseG(): string {
    return `${lt}${sl}g${gt}`;
}
