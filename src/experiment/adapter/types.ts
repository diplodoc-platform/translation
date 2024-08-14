import countries from '@shellscape/i18n-iso-countries';
import languages from '@cospired/i18n-iso-languages';

import {Xliff} from 'src/experiment/xliff/xliff';

const languagesList = languages.langs();

export type Language = (typeof languagesList)[number];

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

export type ExtractOptions = Experiment & TemplateOptions;

export type ExtractOutput = {
    skeleton: string;
    xliff: Xliff;
};

export type ComposeOptions = Experiment & {
    useSource?: boolean;
};

export interface ComposeOutput {
    document: string;
    variables: Record<string, string>;
    externalFile?: string;
    originalFile: string;
    sourceLanguage: string;
    targetLanguage: string;
}
