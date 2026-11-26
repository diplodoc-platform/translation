import type {Renderer} from 'markdown-it';
import type {Consumer} from 'src/consumer';

import {Liquid} from 'src/skeleton/liquid';
import {token} from 'src/utils';

function filePart(type: string, markup: string) {
    return token(type, {
        markup,
        // Match each line in order. markdown-it removes container prefixes
        // from its inline input, but they still belong to the original tag.
        skip: markup.split(/(\n)/).filter(Boolean),
        erule(consumer: Consumer, tokens: Token[], index: number, [from, to]: [number, number]) {
            const crlf = markup.startsWith('\n') && consumer.content[from - 1] === '\r';
            tokens[index].markup = consumer.content.slice(crlf ? from - 1 : from, to);
        },
    });
}

function quotedName(name: string, quote: string) {
    const part = filePart('file_name', quote + name + quote);
    const lines = name.split('\n').map((text) => ({text, tokens: new Liquid(text).tokenize()}));
    part.meta = {lines};
    if (
        lines.some(({tokens}) =>
            tokens.some((child) => child.type === 'text' && child.content.trim()),
        )
    ) {
        // Trailing whitespace belongs inside the quotes. Keep it in lines for
        // rendering, but exclude it from the surrounding sentence.
        part.content = name.trimEnd();
    }
    return part;
}

export const file: Renderer['rules'] = {
    yfm_file(tokens, index) {
        const fileToken = tokens[index];
        const markup = fileToken.meta?.fileMarkup;
        if (
            markup &&
            typeof markup === 'object' &&
            'beforeName' in markup &&
            typeof markup.beforeName === 'string' &&
            'afterName' in markup &&
            typeof markup.afterName === 'string'
        ) {
            const before = Liquid.unescape(markup.beforeName);
            const after = Liquid.unescape(markup.afterName);
            const name = Liquid.unescape(fileToken.content);
            const quote = after[0];

            tokens.splice(
                index,
                1,
                filePart('file_open', before.slice(0, -1)),
                quotedName(name, quote),
                filePart('file_close', after.slice(1)),
            );
        }

        return '';
    },
};
