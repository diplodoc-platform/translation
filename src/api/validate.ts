import {isAbsolute} from 'node:path';
import Ajv, {ErrorObject} from 'ajv';
import languages from '@cospired/i18n-iso-languages';
import countries from '@shellscape/i18n-iso-countries';
import {XMLValidator} from 'fast-xml-parser';

const ajv = new Ajv({
    allErrors: true,
    formats: {
        absolute: isAbsolute,
        language: languages.isValid,
        country: countries.isValid,
        xml: (value: string) => {
            const result = XMLValidator.validate(value);

            return result === true;
        },
    }
});

const format = (data: Record<string, unknown>) => (error: ErrorObject) => {
    const path = error.instancePath.slice(1).split('/');

    let value: any = data;
    try {
        for (const point of path) {
            value = value[point];
        }
    } catch {
        value = 'UNEXPECTED';
    }

    return `- ${path.join(' > ') || 'options'}: ${error.message} (value: ${value})`;
}

class ValidationError extends Error {}

const validateExtractOptions = ajv.compile({
    type: 'object',
    properties: {
        source: {
            type: 'object',
            properties: {
                language: {type: 'string', format: 'language'},
                locale: {type: 'string', format: 'country'},
            },
            required: ['language', 'locale'],
        },
        target: {
            type: 'object',
            properties: {
                language: {type: 'string', format: 'language'},
                locale: {type: 'string', format: 'country'},
            },
            required: ['language', 'locale'],
        }
    },
    required: ['source', 'target'],
});

const validateComposeOptions = ajv.compile({
    type: 'object',
    properties: {
        useSource: {type: 'boolean'},
    },
});

export function validate(target: 'ExtractOptions' | 'ComposeOptions', data: Record<string, unknown>) {
    const validate = {
        'ExtractOptions': validateExtractOptions,
        'ComposeOptions': validateComposeOptions,
    }[target];

    const isValid = validate(data);
    if (!isValid) {
        const message = 'Invalid ' + target + ':\n' + validate.errors?.map(format(data)).join('\n');

        throw new ValidationError(message);
    }
}