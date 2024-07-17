import countries from '@shellscape/i18n-iso-countries';
import languages from '@cospired/i18n-iso-languages';

export type ConsumerOptions = {
    compact?: boolean;
    code?: CodeProcessing;
};

export enum CodeProcessing {
    NO = 'no',
    ALL = 'all',
    PRECISE = 'precise',
    ADAPTIVE = 'adaptive',
}

export type SkeletonOptions = ConsumerOptions;

export type TemplateOptions = {
    source: LanguageLocale;
    target: LanguageLocale;
};

export type LanguageLocale = {
    language: Language;
    locale: countries.Alpha2Code;
};

const languagesList = languages.langs();

export type Language = (typeof languagesList)[number];

export type ExtractOptions = TemplateOptions & SkeletonOptions;

export type JSONData<T = unknown> =
    | string
    | number
    | boolean
    | JSONData<T>[]
    | ({
    [prop: string]: JSONData<T>;
} & T);

export type JSONObject<T = unknown> = {
    [prop: string]: JSONData<T>;
};

export type ExtractOutput<T extends string | JSONObject> = {
    skeleton: T;
    xliff: string;
    units: string[];
};

export type ComposeOptions = {
    useSource?: boolean;
};