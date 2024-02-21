import Token from 'markdown-it/lib/token';
import {CustomRendererHookParameters} from 'src/renderer';

export function image(parameters: CustomRendererHookParameters) {
    const tokens: Token[] = parameters.tokens;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type !== 'inline') {
            continue;
        }

        const inlines = token.children ?? [];

        for (let j = 0; j < inlines.length; j++) {
            if (inlines[j].type === 'image') {
                const openToken = new Token('image_open', 'img', 0);
                const closeToken = new Token('image_close', 'img', 0);
                closeToken.attrs = inlines[j].attrs;

                inlines.splice(j, 1, openToken, ...(inlines[j]?.children ?? []), closeToken);
            }
        }
    }

    return '';
}
