import {XMLValidator} from 'fast-xml-parser';
import cheerio from 'cheerio';

export type TranslationUnitsByID = Map<string, string>;

export type GetTranslationsParameters = {
    xlf: string;
    startID?: number;
};

function parseTranslations(parameters: GetTranslationsParameters): TranslationUnitsByID {
    const {xlf, startID = 1} = parameters;
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const query = cheerio.load(xlf);

    let translations = query('trans-unit').find('target');
    if (!translations) {
        throw new Error('failed to parse trans-units');
    }

    if (translations.length === 0) {
        translations = query('trans-unit');
    }

    const units = new Map<string, string>();

    let i = startID;
    for (const target of translations) {
        let text = '';
        for (const child of target.children ?? []) {
            if (child.type === 'text') {
                text += child.data;
            }
        }

        units.set(String(i++), text);
    }

    return units;
}

function validParameters(parameters: GetTranslationsParameters) {
    const {xlf} = parameters;

    const conditions = [Boolean(xlf), validXML(xlf)];

    return conditions.reduce((a, v) => a && v, true);
}

function validXML(xml: string) {
    const validation = XMLValidator.validate(xml);

    return typeof validation === 'boolean' && validation;
}

export {parseTranslations, validParameters};
export default {parseTranslations, validParameters};
