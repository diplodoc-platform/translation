import {replaceAfter} from 'src/string';
import {tokenize, LiquidTokenType} from 'src/liquid';

import {MarkdownRendererState} from './renderer';

function replacer(content: string, state: MarkdownRendererState) {
    let result = '';

    const translations = state.markdown.translations;

    for (const token of tokenize(content)) {
        if (token.type === LiquidTokenType.Liquid) {
            result += token.lexemme;
            continue;
        }

        let replaced = token.lexemme;
        let success = true;
        let cursor = 0;

        while (success) {
            const id = state.markdown.id;
            const hash = `%%%${id}%%%`;

            const translation = translations.get(String(id));
            if (!translation?.length) {
                success = false;
                continue;
            }

            ({replaced, cursor, success} = replaceAfter(replaced, hash, translation, cursor));
            if (success) {
                state.markdown.id++;
            }
        }

        result += replaced;
    }

    return result;
}

export {replacer};
export default {replacer};
