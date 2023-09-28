import {XMLValidator} from 'fast-xml-parser';
import cheerio from 'cheerio';

export type TranslationUnitsByID = Map<string, string>;

export type GetTranslationsParameters = {
    xlf: string;
    startID?: number;
    useSource?: boolean;
};

function parseTranslations(parameters: GetTranslationsParameters): TranslationUnitsByID {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const {startID = 1, useSource = false} = parameters;
    let xlf = parameters.xlf;
    let {translations, success} = findTargets(xlf);
    if (!success) {
        if (useSource) {
            xlf = replaceSourceWithTarget(xlf);
            ({translations, success} = findTargets(xlf));
        } else {
            throw new Error('did not find any translations');
        }
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

function findTargets(xlf: string) {
    let success = true;
    const query = cheerio.load(xlf);

    const translations = query('trans-unit').find('target');
    if (translations.length === 0) {
        success = false;
    }

    return {
        translations,
        success,
    };
}

function replaceSourceWithTarget(xlf: string) {
    return xlf.replace(/<source>/gmu, '<target>').replace(/<\/source>/gmu, '</target>');
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
