import {TranslationUnitsByID} from 'src/xlf/parser';
import {text} from './text';

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
    return {text};
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
