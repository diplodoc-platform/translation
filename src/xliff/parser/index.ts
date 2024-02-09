import assert, {ok} from 'assert';
import {XMLValidator} from 'fast-xml-parser';
import {load} from 'cheerio';
import {ChildNode, Element, isTag, isText} from 'domhandler';

import {XLFTagToken, XLFTextToken, XLFToken} from 'src/xliff/token';

export type GetTranslationsParams = {
    xliff?: string;
    units?: string[];
    useSource?: boolean;
};

const selfClosingTags = new Set(['x']);

export function parse(parameters: GetTranslationsParams): Array<Array<XLFToken>> {
    validateParams(parameters);

    const {xliff, units, useSource = false} = parameters;
    if (units) {
        return parseTargets(units.map((unit) => selectTargets(unit, useSource).get(0) as Element));
    }

    const targets = selectTargets(xliff as string, useSource);

    return parseTargets(targets.get());
}

function selectTargets(xliff: string, useSource: boolean) {
    const $ = load(xliff, {xml: true});
    const targets = $(useSource ? 'source' : 'target');

    ok(targets.length, 'Did not find any translations');

    return targets;
}

function parseTargets(targets: Element[]) {
    const parsed = new Array<Array<XLFToken>>();
    const ref = {nodes: []};

    for (const target of targets) {
        inorderNodes(target, ref);

        const tokens = nodesIntoXLFTokens(ref.nodes);
        parsed.push(tokens);

        ref.nodes = [];
    }

    return parsed;
}

function inorderNodes(node: ChildNode, ref: {nodes: ChildNode[]}) {
    if (!node) {
        return;
    }

    if (isText(node)) {
        ref.nodes.push(node);
    }

    if (isTag(node)) {
        if (selfClosingTags.has(node.name)) {
            // eslint-disable-next-line no-param-reassign
            node.attribs.nodeType = 'self-closing';
        } else {
            // eslint-disable-next-line no-param-reassign
            node.attribs.nodeType = 'open';
        }
        ref.nodes.push(node);

        let next = node.firstChild;

        while (next) {
            inorderNodes(next, ref);
            next = next.nextSibling;
        }
    }

    if (isTag(node) && !selfClosingTags.has(node.name)) {
        const closeNode = node.cloneNode();
        closeNode.attribs.nodeType = 'close';
        // @ts-ignore
        closeNode.attribs.g = node;
        ref.nodes.push(closeNode);
    }
}

function nodesIntoXLFTokens(nodes: ChildNode[]): XLFToken[] {
    const tokens = new Array<XLFToken>();

    for (const node of nodes) {
        if (isTag(node)) {
            const nodeType = node?.attribs?.nodeType;
            assert(nodeType === 'open' || nodeType === 'close' || nodeType === 'self-closing');

            const token: XLFTagToken = {
                type: 'tag',
                data: node.name,
                nodeType,
                begin: '',
                end: '',
            };

            const syntax = node?.attribs?.ctype;
            if (syntax?.length) {
                token.syntax = syntax;
            }

            const equivText = node?.attribs['equiv-text'];
            if (equivText?.length) {
                token.equivText = equivText;
            }

            // @ts-ignore
            token.g = node.attribs.g;
            token.begin = node?.attribs['x-begin'];
            token.end = node?.attribs['x-end'];

            tokens.push(token);
        } else if (isText(node)) {
            const token: XLFTextToken = {
                type: 'text',
                data: node.data,
            };
            tokens.push(token);
        }
    }

    return tokens;
}

function validateParams(parameters: GetTranslationsParams) {
    if (parameters.units) {
        parameters.units.forEach((unit) => {
            const validation = XMLValidator.validate(unit);

            if (validation !== true) {
                console.log('PROBLEM', unit)
                throw validation.err.msg;
            }
        })
        return;
    }

    const validation = XMLValidator.validate(parameters.xliff as string);

    if (validation !== true) {
        throw validation.err.msg;
    }
}
