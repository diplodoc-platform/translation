import Token from 'markdown-it/lib/token';
import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';

const regexp = /^{%\s*include\s*(notitle)?\s*\[(.+?)]\((.+?)\)\s*%}$/;

function includes(this: MarkdownRenderer, parameters: CustomRendererHookParameters) {
    const {tokens} = parameters;

    for (let i = 0; i < tokens.length; i++) {
        const {type, content} = tokens[i];
        if (type !== 'inline') {
            continue;
        }

        if (!regexp.test(content)) {
            continue;
        }

        const include = new Token('include', '', 0);

        include.content = content;

        tokens[i] = include;
    }

    return '';
}

export {includes};
export default {includes};
