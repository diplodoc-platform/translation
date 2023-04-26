import {replaceAfter} from 'src/string';

import {MarkdownHandlersState} from './index';

function replacer(content: string, state: MarkdownHandlersState) {
    let replaced = content;
    let success = true;
    let cursor = 0;

    const translations = state.markdown.translations;

    while (success) {
        const id = state.markdown.id;
        const hash = `%%%${id}%%%`;

        const translation = translations.get(String(id));
        if (!translation?.length) {
            return replaced;
        }

        ({replaced, cursor, success} = replaceAfter(replaced, hash, translation, cursor));
        if (success) {
            state.markdown.id++;
        }
    }

    return replaced;
}

export {replacer};
export default {replacer};
