import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';

import {parseInclude} from 'src/include';

function includes(this: MarkdownRenderer, parameters: CustomRendererHookParameters) {
    const {tokens} = parameters;

    for (let i = 0; i < tokens.length; i++) {
        const {result, token} = parseInclude(tokens[i]);
        if (result) {
            tokens[i] = token;
        }
    }

    return '';
}

export {includes};
export default {includes};
