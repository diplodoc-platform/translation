import type {JSONSchema7} from 'json-schema';
import type {OpenAPIV3} from 'openapi-types';
import type {JSONValue} from 'src/json';
import type {ParseOptions, TemplateOptions} from 'src/xliff';
import {ok} from 'node:assert';
import Ajv from 'ajv';

import {hash} from 'src/hash';
import {fromXLIFF, parse, template} from 'src/xliff';
import {jsonSchema, openapiSchema30, openapiSchema31, translate} from 'src/json';

type JSONSchema = JSONSchema7 & {$id: string};

type JSONSchemas = {
    schemas: JSONSchema[];
};

export type ExtractOptions = JSONSchemas & TemplateOptions;

export type ExtractOutput = {
    skeleton: JSONValue;
    xliff: string;
    units: string[];
};

export type ComposeOptions = JSONSchemas & ParseOptions;

export function extract(content: JSONValue, {schemas = [], source, target}: ExtractOptions) {
    const mainSchema = getMainSchema(content, schemas);
    const hashed = hash();
    const ajv = setupAjv(schemas);

    content = clone(content);

    ajv.addKeyword(translate.extract(hashed));
    ajv.validate(mainSchema, content);

    const xliff = template(hashed.segments, {source, target});

    return {skeleton: content, xliff, units: hashed.segments};
}

export function compose(skeleton: JSONValue, xliff: string | string[], {schemas = [], useSource = false}: ComposeOptions) {
    const mainSchema = getMainSchema(skeleton, schemas);
    const units = parse(xliff, {useSource}).map(fromXLIFF);
    const ajv = setupAjv(schemas);

    skeleton = clone(skeleton);

    ajv.addKeyword(translate.compose(units));
    ajv.validate(mainSchema, skeleton);

    return skeleton;
}

function setupAjv(schemas: JSONSchema7[]) {
    schemas = schemas.concat([jsonSchema]);

    const ajv = new Ajv({
        strictSchema: false,
        validateSchema: false,
        validateFormats: false,
        strict: false,
    });

    schemas.forEach((schema) => {
        ajv.removeSchema(schema);
        ajv.addSchema(schema);
    });

    return ajv;
}

function getMainSchema(content: JSONValue, schemas: JSONSchema[]) {
    const schemaMap = zip(schemas, '$id');

    const _schema = (content as JSONSchema).$schema
    if (typeof _schema === 'string') {
        if (_schema === jsonSchema.$id) {
            return jsonSchema;
        }

        const schema = schemaMap[_schema];

        ok(schema, 'Data schema is not defined in schemas list');

        return schema;
    }

    let _openapi = (content as OpenAPIV3.Document).openapi;
    if (typeof _openapi === 'string' || typeof _openapi === 'number') {
        _openapi = String(_openapi);

        switch (true) {
            case _openapi.startsWith('3.1'): return openapiSchema31;
            case _openapi.startsWith('3'): return openapiSchema30;
        }

    }

    return schemas[0];
}

function clone(json: JSONValue): JSONValue {
    return JSON.parse(JSON.stringify(json));
}

function zip<F extends string, T extends {[K in F]: string}>(array: T[], field: F): Record<string, T> {
    return array.reduce((acc, item) => {
        acc[item[field]] = item;
        return acc;
    }, {} as Record<string, T>);
}