import { generateX } from 'src/xliff/generator';

function generateBreak(tokens: Token[], i: number) {
    const _break = tokens[i];

    return generateX({
        ctype: `lb`,
        equivText: _break.content || '\n',
    });
}

export const breaks = {
    hardbreak: generateBreak,
    softbreak: generateBreak,
};