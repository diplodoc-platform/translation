import {parser} from 'src/xlf';
import {XLFMDRenderer} from 'src/xlf/renderer/xlf-md';

export type TranslationsParameters = {
    xlf: string;
    useSource?: boolean;
};

function getTranslations(parameters: TranslationsParameters) {
    if (!validTranslationsParameters(parameters)) {
        throw new Error('invalid parameters');
    }
    const translationsTokens = parser.parseTranslations(parameters);
    const renderer = new XLFMDRenderer();

    const translations = new Map<string, string>();
    let rendered = '';
    for (let i = 0; i < translationsTokens.length; i++) {
        const tokens = translationsTokens[i];

        rendered += renderer.render(tokens);

        translations.set(String(i), rendered);
        rendered = '';
    }

    return translations;
}

function validTranslationsParameters(parameters: TranslationsParameters) {
    const conditions = [
        parameters.useSource === undefined || typeof parameters.useSource === 'boolean',
        parameters.xlf !== undefined,
        parser.validParameters(parameters),
    ];

    return conditions.reduce((a, v) => a && v, true);
}

export {getTranslations, validTranslationsParameters};
export default {getTranslations, validTranslationsParameters};
