import {gt, lt, qt, sl} from 'src/xliff/symbols';

export type GenerateXParams = {
    ctype: string;
    equivText: string;
};

export function generateX(parameters: GenerateXParams) {
    const {ctype, equivText} = parameters;

    let rendered = `${lt}x`;

    if (ctype?.length) {
        rendered += ` ctype=${qt}${ctype}${qt}`;
    }

    if (equivText?.length) {
        rendered += ` equiv-text=${qt}${equivText}${qt}`;
    }

    if (ctype?.length || equivText?.length) {
        rendered += ' ';
    }

    rendered += sl + gt;

    return rendered;
}
