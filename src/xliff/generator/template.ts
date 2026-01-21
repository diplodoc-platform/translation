import type countries from '@shellscape/i18n-iso-countries';

import languages from '@cospired/i18n-iso-languages';

export type TemplateOptions = {
    source: LanguageLocale;
    target: LanguageLocale;
};

export type LanguageLocale = {
    language: Language;
    locale: countries.Alpha2Code;
};

const _languagesList = languages.langs();

export type Language = (typeof _languagesList)[number];

function unit(source: string, index: number) {
    return `
      <trans-unit id="${index}">
        ${source}
      </trans-unit>    
    `.trim();
}

export function template(units: string[], {source, target}: TemplateOptions) {
    return `
<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file original="file.ext" source-language="${source.language}-${
      source.locale
  }" target-language="${target.language}-${target.locale}" datatype="markdown">
    <header>
      <skeleton>
        <external-file href="file.skl"></external-file>
      </skeleton>
    </header>
    <body>
      ${units.map(unit).join('\n      ')}
    </body>
  </file>
</xliff>
    `.trim();
}
