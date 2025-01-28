import type {JSONSchema7} from 'json-schema';
import type {OpenAPIV3} from 'openapi-types';
import type {JSONObject} from 'src/json';
import type {ParseOptions, TemplateOptions} from 'src/xliff';
import type {SkeletonOptions} from 'src/skeleton';

import {ok} from 'node:assert';
import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';

import {hash} from 'src/hash';
import {fromXLIFF, parse, template} from 'src/xliff';
import {jsonSchema, openapiSchema30, openapiSchema31, translate} from 'src/json';

type JSONSchema = JSONSchema7 & {$id: string};

type JSONSchemas = {
    schemas: JSONSchema[];
};

export type AjvOptions = {
    keywords?: string[];
    extendWithSchemas?: JSONSchema[];
};

export type AjvConfig = {
    ajvOptions?: AjvOptions;
};

export type ExtractOptions = JSONSchemas & TemplateOptions & SkeletonOptions & AjvConfig;

export type ExtractOutput = {
    skeleton: JSONObject;
    xliff: string;
    units: string[];
};

export type ComposeOptions = JSONSchemas & ParseOptions & AjvConfig;

export function extract(
    content: JSONObject,
    {schemas = [], source, target, compact, ajvOptions}: ExtractOptions,
): ExtractOutput {
    const mainSchema = getMainSchema(content, schemas);
    const hashed = hash();
    const ajv = setupAjv(schemas, ajvOptions, mainSchema);

    ajv.addKeyword(translate.extract(hashed, {compact}));
    ajv.validate(mainSchema, content);

    const xliff = template(hashed.segments, {source, target});

    return {skeleton: content, xliff, units: hashed.segments};
}

export function compose(
    skeleton: JSONObject,
    xliff: string | string[],
    {schemas = [], useSource = false, ajvOptions}: ComposeOptions,
) {
    const mainSchema = getMainSchema(skeleton, schemas);
    const units = parse(xliff, {useSource}).map(fromXLIFF);
    const ajv = setupAjv(schemas, ajvOptions, mainSchema);

    ajv.addKeyword(translate.compose(units));
    ajv.validate(mainSchema, skeleton);

    return skeleton;
}

function setupAjv(schemas: JSONSchema7[], ajvOptions: AjvOptions = {}, mainSchema: JSONSchema7) {
    const {keywords, extendWithSchemas = [jsonSchema]} = ajvOptions;
    schemas = schemas.concat(extendWithSchemas);

    const ajv = new Ajv({
        strictSchema: false,
        validateSchema: false,
        validateFormats: false,
        strict: false,
        allErrors: true,
        $data: true,
    });

    if (keywords) {
        ajvKeywords(ajv, keywords);
    }

    schemas.forEach((schema) => {
        ajv.removeSchema(schema);

        if (schema.$id !== mainSchema.$id) {
            ajv.addSchema(schema);
        }
    });

    return ajv;
}

function getMainSchema(content: JSONObject, schemas: JSONSchema[]) {
    const schemaMap = zip([openapiSchema31, openapiSchema30, ...schemas], '$id');

    const _schema = (content as unknown as JSONSchema).$schema;
    if (typeof _schema === 'string') {
        if (_schema === jsonSchema.$id) {
            return jsonSchema;
        }

        const schema = schemaMap[_schema];

        ok(schema, 'Data schema is not defined in schemas list');

        return schema;
    }

    const _openapi = (content as unknown as OpenAPIV3.Document).openapi;
    if (typeof _openapi === 'string' || typeof _openapi === 'number') {
        return getOpenAPISchema(resolveOpenAPIVersion(_openapi), schemaMap);
    }

    return schemas[0];
}

function resolveOpenAPIVersion(version: string) {
    switch (true) {
        case version.startsWith('3.1'):
            return '3.1';
        case version.startsWith('3'):
            return '3.0';
        default:
            return '3.0';
    }
}

function getOpenAPISchema(version: string, schemas: Record<string, JSONSchema>) {
    const schemaMapKeys = Object.keys(schemas);

    for (const key of schemaMapKeys) {
        if (key.includes(version)) {
            return schemas[key];
        }
    }

    return schemas[0];
}

function zip<F extends string, T extends {[K in F]: string}>(
    array: T[],
    field: F,
): Record<string, T> {
    return array.reduce(
        (acc, item) => {
            acc[item[field]] = item;
            return acc;
        },
        {} as Record<string, T>,
    );
}
