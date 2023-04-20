import {TranslationUnitsByID} from 'src/xlf/parser';
import {text} from './text';
import {linkClose} from './link';

export type MarkdownHandlersState = {
    markdown: {
        translations: TranslationUnitsByID;
    };
};

export type MarkdownHandlersParameters = {
    translations: TranslationUnitsByID;
};

function generate(parameters: MarkdownHandlersParameters) {
    return {handlers: handlers(), initState: initState(parameters)};
}

function handlers() {
    return {text, link_close: linkClose};
}

function initState(parameters: MarkdownHandlersParameters) {
    const {translations} = parameters;

    return () => ({
        markdown: {
            translations,
        },
    });
}

export {generate};
export default {generate};
