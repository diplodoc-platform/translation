import type {Renderer} from 'markdown-it';

import {generateCloseG, generateOpenG, generateX} from 'src/xliff/generator';

const open = (ctype: string) => (tokens: Token[], i: number) => {
    const token = tokens[i];
    const markup = token.markup;

    if (token.g) {
        return generateOpenG({
            ctype,
            equivText: `${markup}{{text}}${markup}`,
            xBegin: markup,
            xEnd: markup,
        });
    }

    return generateX({
        ctype: ctype + '_open',
        equivText: markup,
    });
};

const close = (ctype: string) => (tokens: Token[], i: number) => {
    const token = tokens[i];
    const markup = token.markup;

    if (token.g) {
        return generateCloseG();
    }

    return generateX({
        ctype: ctype + '_close',
        equivText: markup,
    });
};

export const pair: Renderer['rules'] = {
    strong_open: open('bold'),
    strong_close: close('bold'),
    em_open: open('italic'),
    em_close: close('italic'),
    s_open: open('strikethrough'),
    s_close: close('strikethrough'),
    sup_open: open('sup'),
    sup_close: close('sup'),
    underline_open: open('underline'),
    underline_close: close('underline'),
    sub_open: open('sub'),
    sub_close: close('sub'),
    monospace_open: open('monospace'),
    monospace_close: close('monospace'),
};
