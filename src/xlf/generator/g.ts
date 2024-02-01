import {gt, lt, qt, sl} from 'src/xlf/symbols';

export type OpenGParams = {
    ctype: string;
    equivText: string;
};

function generateOpenG(parameters: OpenGParams): string {
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

function generateCloseG(): string {
    return `${lt}${sl}g${gt}`;
}

export {generateOpenG, generateCloseG};
export default {generateOpenG, generateCloseG};
