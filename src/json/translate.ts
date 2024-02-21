import type {JSONType, KeywordCxt} from 'ajv';
import type {Hash} from 'src/hash';
import {_} from 'ajv';
import {Consumer} from 'src/consumer';
import {render} from 'src/skeleton';
import {replace, token} from 'src/utils';

type Schema = 'md' | 'text';

function genCode(ontranslate: (text: string, schema: Schema) => string) {
    return function (cxt: KeywordCxt) {
        const {gen, data, it, schema} = cxt;
        const {parentData, parentDataProperty} = it;

        gen.if(_`typeof ${data} == "string" && ${parentData} !== undefined`, () => {
            const func = gen.scopeValue('func', {ref: ontranslate});
            gen.assign(data, _`${func}(${data}, ${schema})`);
            gen.assign(_`${parentData}[${parentDataProperty}]`, data);
        });
    };
}

function extract(hash: Hash) {
    return {
        keyword: 'translate',
        type: ['string', 'object', 'array'] as JSONType[],
        code: genCode((text, schema) => {
            if (text.match(/^%%%\d+%%%$/)) {
                return text;
            }

            if (schema === 'text') {
                const consumer = new Consumer(text, 0, hash);
                consumer.process(token('text', {content: text}));

                return consumer.content;
            } else if (schema === 'md') {
                return render(text, hash);
            }

            return text;
        }),
    };
}

function compose(units: string[]) {
    return {
        keyword: 'translate',
        type: ['string', 'object', 'array'] as JSONType[],
        code: genCode((text) => {
            return replace(text, units)[0];
        }),
    };
}

export const translate = {
    extract,
    compose,
};