import {TranslationUnitsByID} from 'src/xlf/parser';

export type HandlersState = {
    handlers: {
        translations: TranslationUnitsByID;
    };
};

const handlers = {};

function translationHandlers(translations: TranslationUnitsByID) {
    function initState() {
        return {
            handlers: {
                translations,
            },
        };
    }

    return {initState, handlers};
}

export {translationHandlers};
export default {translationHandlers};
