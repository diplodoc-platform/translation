import type countries from '@shellscape/i18n-iso-countries';
import type {Xliff} from 'src/experiment/xliff/xliff';
import type {TransformOptions} from 'src/experiment/transform';
import type {TranslateOptions} from 'src/experiment/translate';

import languages from '@cospired/i18n-iso-languages';

const _languagesList = languages.langs();

export type Language = (typeof _languagesList)[number];

export type LanguageLocale = {
    language: Language;
    locale: countries.Alpha2Code;
};

export type TemplateOptions = {
    source: LanguageLocale;
    target: LanguageLocale;
    originalFile: string;
    skeletonFile?: string;
};

interface Experiment {
    useExperimentalParser: true;
}

export type ExtractOptions = Experiment & TemplateOptions & TransformOptions;

export type ExtractOutput = {
    skeleton: string;
    xliff: Xliff;
};

export type ComposeOptions = Experiment & TranslateOptions;

export interface ComposeOutput {
    document: string;
    variables: Record<string, string>;
    externalFile?: string;
    originalFile: string;
    sourceLanguage: string;
    targetLanguage: string;
}
