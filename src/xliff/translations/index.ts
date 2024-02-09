import {ok} from 'assert';
import {XLF} from 'src/xliff';
import {XLFMDRenderer} from 'src/xliff/renderer/xliff-md';

export type TranslationsParams = {
    xliff?: string;
    units?: string[];
    useSource?: boolean;
};

export function getTranslations(parameters: TranslationsParams) {
    validateTranslationsParams(parameters);

    const translationsTokens = XLF.parse(parameters);
    const renderer = new XLFMDRenderer();

    const translations = new Map<string, string>();

    for (let i = 0; i < translationsTokens.length; i++) {
        const tokens = translationsTokens[i];

        translations.set(String(i + 1), renderer.render(tokens));
    }

    return translations;
}

function validateTranslationsParams(parameters: TranslationsParams) {
    ok(
        parameters.useSource === undefined || typeof parameters.useSource === 'boolean',
        'Unexpected useSource value',
    );
    ok(parameters.xliff || parameters.units?.length, 'Source is empty');
}
