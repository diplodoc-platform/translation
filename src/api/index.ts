import type {ComposeOptions as MdComposeOptions, ExtractOptions as MdExtractOptions} from './md';
import type {
    ComposeOptions as JsonComposeOptions,
    ExtractOptions as JsonExtractOptions,
} from './json';
import type {JSONObject} from 'src/json';
import type {
    ComposeOptions as MdExpComposeOptions,
    ComposeOutput as MdExpComposeOutput,
    ExtractOptions as MdExpExtractOptions,
    ExtractOutput as MdExpExtractOutput,
} from './mdExp';

import {compose as composeMd, extract as extraactMd} from './md';
import {compose as composeMdExp, extract as extractMdExp} from './mdExp';
import {compose as composeJson, extract as extraactJson} from './json';
import {validate} from './validate';
export type {AjvOptions} from './json';

const type = (content: string | JSONObject, experimental: boolean) => {
    if (typeof content === 'string') {
        return experimental ? 'mdExp' : 'md';
    }

    return 'json';
};

export type ExtractOptions = JsonExtractOptions | MdExtractOptions;

export type ExtractOutput<T extends string | JSONObject> = {
    skeleton: T;
    xliff: string;
    units: string[];
};

export function extract(content: string, options: MdExpExtractOptions): MdExpExtractOutput;
export function extract(content: string, options: ExtractOptions): ExtractOutput<string>;
export function extract(
    content: JSONObject,
    options: JsonExtractOptions,
): ExtractOutput<JSONObject>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extract(content: any, options: any): ExtractOutput<any> | MdExpExtractOutput {
    validate('ExtractOptions', options);

    return extract[type(content, options.useExperimentalParser)](content, options);
}

extract.mdExp = extractMdExp;
extract.md = extraactMd;
extract.json = extraactJson;

export type ComposeOptions = JsonComposeOptions | MdComposeOptions;

export function compose(
    skeleton: string,
    xliff: string,
    options: MdExpComposeOptions,
): MdExpComposeOutput;
export function compose(
    skeleton: string,
    xliff: string | string[],
    options: ComposeOptions,
): string;
export function compose(
    skeleton: JSONObject,
    xliff: string | string[],
    options: JsonComposeOptions,
): JSONObject;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compose(skeleton: any, xliff: any, options: any): any {
    validate('ComposeOptions', options);

    return compose[type(skeleton, options.useExperimentalParser)](skeleton, xliff, options);
}

compose.mdExp = composeMdExp;
compose.md = composeMd;
compose.json = composeJson;
