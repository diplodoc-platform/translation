import type {CustomRendererHookParameters} from 'src/renderer';

import Token from 'markdown-it/lib/token';

import {token} from 'src/utils';
import {mt} from 'src/symbols';

export function image(parameters: CustomRendererHookParameters) {
    const tokens: Token[] = parameters.tokens;

    for (let i = 0; i < tokens.length; i++) {
        const block = tokens[i];
        if (block.type !== 'inline') {
            continue;
        }

        const inlines = block.children ?? [];

        for (let j = 0; j < inlines.length; j++) {
            if (inlines[j].type === 'image') {
                const openToken = new Token('image_open', 'img', 0);
                const closeToken = new Token('image_close', 'img', 0);
                const fakeContent: Token[] = inlines[j]?.children?.length
                    ? []
                    : // Fake content is important for segmentation.
                      // It forces to properly split same strings
                      // "A ![](./empty/image). B."
                      [token('text', {content: mt})];
                const content = inlines[j].children as Token[];
                closeToken.attrs = inlines[j].attrs;

                inlines.splice(j, 1, ...fakeContent, openToken, ...content, closeToken);
            }
        }
    }

    return '';
}
