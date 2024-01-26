import languages from '@cospired/i18n-iso-languages';
import countries from '@shellscape/i18n-iso-countries';

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

const gap = (ident: number) => (chunk: string) => {
    const gap = ' '.repeat(ident);
    return chunk.split('\n').map((part) => gap + part).join('\n')
};

export type Language = (typeof languagesList)[number];

function generateTemplate(parameters: TemplateParameters, units: string[]) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }
    const {source, target, skeletonPath, markdownPath} = parameters;
    let indentation = 0;
    let before = '<?xml version="1.0" encoding="UTF-8"?>';
    before += '\n';

    before += '<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">';
    before += '\n';

    indentation += 2;

    before += ' '.repeat(indentation);
    before += `<file original="${markdownPath}" source-language="${source.language}-${source.locale}" target-language="${target.language}-${target.locale}" datatype="markdown">`;
    before += '\n';

    indentation += 2;

    before += ' '.repeat(indentation);
    before += '<header>';
    before += '\n';

    indentation += 2;

    before += ' '.repeat(indentation);
    before += '<skeleton>';
    before += '\n';

    indentation += 2;

    before += ' '.repeat(indentation);
    before += `<external-file href="${skeletonPath}"></external-file>`;
    before += '\n';

    indentation -= 2;

    before += ' '.repeat(indentation);
    before += '</skeleton>';
    before += '\n';

    indentation -= 2;

    before += ' '.repeat(indentation);
    before += '</header>';
    before += '\n';

    before += ' '.repeat(indentation);
    before += '<body>';
    before += '\n';

    before += units.map(gap(indentation)).join('\n');
    before += '\n';

    let after = ' '.repeat(indentation);
    after += '</body>';
    after += '\n';

    indentation -= 2;

    after += ' '.repeat(indentation);
    after += '</file>';
    after += '\n';

    indentation -= 2;
    after += ' '.repeat(indentation);
    after += '</xliff>';
    after += '\n';

    return before + after;
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

export {generateTemplate, validParameters};
export default {generateTemplate, validParameters};
