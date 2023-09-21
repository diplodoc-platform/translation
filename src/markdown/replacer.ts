import {replaceAfter} from 'src/string';
import {MarkdownRendererState} from './renderer';

function replacer(content: string, state: MarkdownRendererState) {
    const translations = state.markdown.translations;
    let replaced = content;

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

    return replaced;
}

export {replacer};
export default {replacer};
