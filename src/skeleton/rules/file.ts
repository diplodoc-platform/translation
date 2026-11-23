import type Renderer from 'markdown-it/lib/renderer';

import {Liquid} from 'src/skeleton/liquid';
import {token} from 'src/utils';

function fileBoundary(type: 'file_open' | 'file_close', source: string) {
    const markup = Liquid.unescape(source);
    return token(type, {markup, skip: markup});
}

export const file: Renderer.RenderRuleRecord = {
    yfm_file(tokens, index) {
        const fileToken = tokens[index];
        const markup = fileToken.meta?.fileMarkup;
        if (!markup) {
            // Older file plugins only expose the normalized HTML attributes.
            return '';
        }

        tokens.splice(
            index,
            1,
            fileBoundary('file_open', markup.beforeName),
            ...new Liquid(fileToken.content).tokenize(),
            fileBoundary('file_close', markup.afterName),
        );

        return '';
    },
};
