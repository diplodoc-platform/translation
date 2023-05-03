import languages from '@cospired/i18n-iso-languages';
import countries from 'i18n-iso-countries';
import {XMLBuilder} from 'fast-xml-parser';

export type TemplateParameters = {
    source: LanguageLocale;
    target: LanguageLocale;
    skeletonPath: string;
    markdownPath: string;
};

export type LanguageLocale = {
    language: Language;
    locale: countries.Alpha2Code;
};

const languagesList = languages.langs();

export type Language = (typeof languagesList)[number];

const options = {
    format: true,
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    suppressBooleanAttributes: false,
};

const builder = new XMLBuilder(options);

function generate(parameters: TemplateParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const {source, target, markdownPath, skeletonPath} = parameters;

    const doc = {
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        xliff: {
            '@_xmlns': 'urn:oasis:names:tc:xliff:document:1.2',
            '@_version': '1.2',
            file: {
                '@_original': markdownPath,
                '@_source-language': `${source.language}-${source.locale}`,
                '@_target-language': `${target.language}-${target.locale}`,
                '@_datatype': 'markdown',
                header: {
                    skeleton: {
                        'external-file': {
                            '@_href': skeletonPath,
                        },
                    },
                },
                body: {},
            },
        },
    };

    const rendered = builder.build(doc);

    let [before, after] = rendered.split('<body>');

    const indentation = before.length - before.trimEnd().length - 1;

    before += '<body>\n';
    after = ' '.repeat(indentation) + after;

    return {template: [before, after] as [string, string], indentation};
}

function validParameters(parameters: TemplateParameters) {
    const {source, target, skeletonPath, markdownPath} = parameters;

    const conditions = [
        ...[source, target].map(validLanguageLocale),
        ...[skeletonPath, markdownPath].map(Boolean),
    ];

    return conditions.reduce((a, v) => a && v, true);
}

function validLanguageLocale(parameters: LanguageLocale) {
    const {language, locale} = parameters;

    return languages.isValid(language) && countries.isValid(locale);
}

export {generate, validParameters};
export default {generate, validParameters};
