import assert, {ok} from 'assert';
import {load} from 'cheerio';
import {ChildNode, Element, isTag, isText} from 'domhandler';

import {XLFTagToken, XLFTextToken, XLFToken} from 'src/xliff/token';

const selfClosingTags = new Set(['x']);

export type ParseOptions = {
    useSource?: boolean;
};

export function parse(xliff: string | string[], options?: ParseOptions): Array<Array<XLFToken>> {
    const {useSource = false} = options || {};
    if (Array.isArray(xliff)) {
        return parseTargets(xliff.map((unit) => selectTargets(unit, useSource).get(0) as Element));
    }

    const targets = selectTargets(xliff, useSource);

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

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const idx = Number((target.parent! as Element).attribs.id);
        parsed[idx] = tokens;

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
