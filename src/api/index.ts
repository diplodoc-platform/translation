import type {ComposeOptions as MdComposeOptions, ExtractOptions as MdExtractOptions, ExtractOutput as MdExtractOutput } from './md';
import type {ComposeOptions as JsonComposeOptions, ExtractOptions as JsonExtractOptions, ExtractOutput as JsonExtractOutput } from './json';
import {compose as composeMd, extract as extraactMd } from './md';
import {compose as composeJson, extract as extraactJson} from './json';
import {validate} from './validate';
import {JSONValue} from 'src/json';

export type ExtractOptions = Parameters<typeof extract>[1];

export type ComposeOptions = Parameters<typeof compose>[2];

export function extract(content: JSONValue, params: JsonComposeOptions): JsonExtractOutput
export function extract(content: string, params: MdExtractOptions): MdExtractOutput
export function extract(content: any, params: any): any {
    validate('ExtractOptions', params);

    const type = typeof content === 'string' ? 'md' : 'json';

    return extract[type](content, params);
}

extract.md = extraactMd;
extract.json = extraactJson;

export function compose(skeleton: JSONValue, xliff: string | string[], options: JsonExtractOptions): JSONValue
export function compose(skeleton: string, xliff: string | string[], options: MdComposeOptions): string
export function compose(skeleton: any, xliff: string | string[], options: any): any {
    validate('ComposeOptions', options);

    const type = typeof skeleton === 'string' ? 'md' : 'json';

    return compose[type](skeleton, xliff, options);
}

compose.md = composeMd;
compose.json = composeJson;