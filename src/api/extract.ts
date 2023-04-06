import languages from '@cospired/i18n-iso-languages';

import countries from 'i18n-iso-countries';

export type ExtractParameters = {
    source: LanguageLocale;
    target: LanguageLocale;
    markdown: string;
    path?: string;
};

export type LanguageLocale = {
    language: Language;
    locale: countries.Alpha2Code;
};

const languagesList = languages.langs();

export type Language = typeof languagesList[number];

export type ExtractOutput = {
    skeleton: string;
    xlf: string;
};

function extract(parameters: ExtractParameters): ExtractOutput {
    if (!validate(parameters)) {
        throw new Error('invalid parameters');
    }

    return {xlf: '', skeleton: ''};
}

function validate(parameters: ExtractParameters) {
    const {source, target, markdown, path = ''} = parameters;

    const locales = [source.locale, target.locale].map(countries.isValid);
    const langs = [source.language, target.language].map(languages.isValid);
    const strings = [markdown, path].map((s) => s !== undefined);

    return [...locales, ...langs, ...strings].reduce((a, v) => a && v, true);
}

export {extract};
export default {extract};
