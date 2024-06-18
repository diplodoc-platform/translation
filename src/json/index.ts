import {dirname, join} from 'node:path';
import {readPath} from './utils';

export type {JSONObject, LinkedJSONObject} from './types';

export {translate} from './translate';

export {linkRefs, unlinkRefs} from './refs';

const root = dirname(require.resolve('@diplodoc/translation/package'));

export const jsonSchema = readPath(join(root, 'schemas/json-schema.yaml')).data;

export const openapiSchema30 = readPath(join(root, 'schemas/openapi-schema-30.yaml')).data;

export const openapiSchema31 = readPath(join(root, 'schemas/openapi-schema-31.yaml')).data;
