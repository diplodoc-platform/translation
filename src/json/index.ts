import {resolve} from 'node:path';
import {readPath} from './utils';

export type JSONValue<T = any> = Record<string, T> | T[];

export {translate} from './translate';

export {resolve} from './resolve';

export const jsonSchema = readPath(resolve(__dirname, './schemas/json-schema.yaml')).data;

export const openapiSchema30 = readPath(resolve(__dirname, './schemas/openapi-schema-30.yaml')).data;

export const openapiSchema31 = readPath(resolve(__dirname, './schemas/openapi-schema-31.yaml')).data;

