import languages from '@cospired/i18n-iso-languages';
import countries from '@shellscape/i18n-iso-countries';

export type TemplateParams = {
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

function unit(source: string, index: number) {
    return `
      <trans-unit id="${index + 1}">
        ${source}
      </trans-unit>    
    `.trim();
}

export function generate(parameters: TemplateParams, units: string[]) {
    if (!validParams(parameters)) {
        throw new Error('invalid parameters');
    }
    const {source, target, skeletonPath, markdownPath} = parameters;
    return `
<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file original="${markdownPath}" source-language="${source.language}-${
      source.locale
  }" target-language="${target.language}-${target.locale}" datatype="markdown">
    <header>
      <skeleton>
        <external-file href="${skeletonPath}"></external-file>
      </skeleton>
    </header>
    <body>
      ${units.map(unit).join('\n      ')}
    </body>
  </file>
</xliff>
    `.trim();
}

function validParams(parameters: TemplateParams) {
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
