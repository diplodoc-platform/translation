import {getTranslations, validTranslationsParameters} from 'src/xlf/translations';
import markdown from 'src/markdown';

export type ComposeParameters = {
    skeleton: string;
    xlf: string;
    useSource?: boolean;
} & markdown.renderer.DiplodocParameters;

function compose(parameters: ComposeParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const translations = getTranslations(parameters);
    const translated = markdown.renderer.render({...parameters, translations});

    return translated;
}

function validParameters(parameters: ComposeParameters) {
    const conditions = [
        parameters.useSource === undefined || typeof parameters.useSource === 'boolean',
        parameters.skeleton !== undefined,
        parameters.xlf !== undefined,
        validTranslationsParameters(parameters),
        markdown.renderer.validDiplodocParameters(parameters),
    ];

    return conditions.reduce((a, v) => a && v, true);
}

export {compose};
export default {compose};
