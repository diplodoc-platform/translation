import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {MarkdownHandlersState} from './index';

function text(this: MarkdownRenderer<MarkdownHandlersState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    const {markdown} = this.state;

    const replaced = replaceHashes(content, markdown.translations);

    tokens[i].content = replaced;

    return '';
}

function replaceHashes(content: string, translations: Map<string, string>) {
    let replaced = content;

    replaced = replaced.replace(/%%%(\d+)%%%/mu, function (match, id) {
        const parsed = parseInt(id, 10);

        const translation = translations.get(String(parsed));
        if (!translation?.length) {
            throw new Error('failed replacing with translation');
        }

        return translation;
    });

    return replaced;
}

export {text};
export default {text};
