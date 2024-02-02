import {CustomRenderer, CustomRendererHookParams} from '@diplodoc/markdown-it-custom-renderer';

import {parseInclude} from 'src/include';

export function includes(this: CustomRenderer, parameters: CustomRendererHookParams) {
    const {tokens} = parameters;

    for (let i = 0; i < tokens.length; i++) {
        const {result, token} = parseInclude(tokens[i]);
        if (result) {
            tokens[i] = token;
        }
    }

    return '';
}
