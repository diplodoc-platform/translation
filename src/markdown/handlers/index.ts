import {TranslationUnitsByID} from 'src/xlf/parser';
import {text} from './text';
import {linkClose} from './link';
import {imageClose} from './image';
import {yfmFile} from './diplodoc/file';

export type MarkdownHandlersState = {
    markdown: {
        id: number;
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
    return {text, link_close: linkClose, image_close: imageClose, yfm_file: yfmFile};
}

function initState(parameters: MarkdownHandlersParameters) {
    const {translations} = parameters;

    return () => ({
        markdown: {
            translations,
            id: 1,
        },
    });
}

export {generate};
export default {generate};
