import {XMLValidator} from 'fast-xml-parser';
import cheerio from 'cheerio';
import {type Element, type Text} from 'domhandler';

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
    for (const target of translations.get()) {
        const ref = {seq: []};
        flattenDOMTree(target, ref);

        const markdown = renderXLFIntoMarkdown(ref.seq);

        units.set(String(i++), markdown);
    }

    return units;
}

// fallback: use source if target is absent
function replaceSourceWithTarget(xlf: string) {
    return xlf.replace(/<source>/gmu, '<target>').replace(/<\/source>/gmu, '</target>');
}

// extract all trans-units->target
function findTargets(xlf: string) {
    const query = cheerio.load(xlf);

    const translations = query('trans-unit').children('target');
    if (translations.length === 0) {
        return {
            success: false,
            translations,
        };
    }

    return {
        translations,
        success: true,
    };
}

// receive nodes in DFO
function flattenDOMTree(node: Element | null, ref: {seq: Element[]}) {
    if (!node) {
        return;
    }

    const fst = node;
    if (node.name === 'g') {
        const [_, open] = node.attribs.ctype.split('-');
        const openNode = {...node, attribs: {ctype: `x-${open}`}} as unknown as Element;

        ref.seq.push(openNode);
    } else {
        ref.seq.push(node);
    }

    // eslint-disable-next-line no-param-reassign
    node = node?.firstChild as Element;

    while (node) {
        flattenDOMTree(node, ref);
        // eslint-disable-next-line no-param-reassign
        node = node.nextSibling as Element;
    }

    if (fst && fst?.name === 'g') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, open, close] = fst.attribs.ctype.split('-');
        const newNode = {...fst, attribs: {ctype: `x-${close}`}} as unknown as Element;

        ref.seq.push(newNode);
    }
}

// render dom nodes into markdown
function renderXLFIntoMarkdown(nodes: (Element | Text)[]) {
    let text = '';
    for (const child of nodes) {
        if (child?.type === 'text') {
            text += child.data;
            continue;
        }

        if (child.name === 'g') {
            const [_, syntax] = child.attribs.ctype.split('-');
            text += syntax;
        }

        if (child.name === 'x') {
            if (child.attribs.ctype === 'x-link-href') {
                text += child.attribs['equiv-text'];
            }
            text += ' ';
        }
    }

    return text;
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
