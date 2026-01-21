import type {XmlParserElementChildNode, XmlParserElementNode, XmlParserResult} from 'xml-parser-xo';

import yaml from 'js-yaml';
import xmlParser from 'xml-parser-xo';

import {YamlQuotingTypeQuote} from './constants';
import {unescapeXmlText} from './xliff/utils';

/* eslint-disable no-console */

export type TranslateOptions = {
    useSource?: boolean;
    parsedXliff?: XmlParserResult;
};

export function translate(xliffData: string, skeletonData: string, options?: TranslateOptions) {
    const {useSource, parsedXliff} = options ?? {};
    const xliff =
        parsedXliff ??
        xmlParser(xliffData, {
            strictMode: true,
        });

    const externalFileElement = findNodeByNamePath(xliff.root, [
        'header',
        'skeleton',
        'external-file',
    ]);

    const fileNode = findNodeByName(xliff.root, 'file');
    if (!fileNode) {
        throw new Error('File node not found');
    }

    const originalFile = getAttr(fileNode, 'original');
    const sourceLanguage = getAttr(fileNode, 'source-language');
    const targetLanguage = getAttr(fileNode, 'target-language');

    let externalFile;
    if (externalFileElement) {
        externalFile = getAttr(externalFileElement, 'href');
    }

    const body = findNodeByName(xliff.root, 'body');
    if (!body) {
        throw new Error('Body is not found');
    }

    const variableValue: Record<string, string> = {};

    body.children?.forEach((node) => {
        if (node.type !== 'Element') {
            return;
        }
        if (node.name !== 'trans-unit') {
            return;
        }

        const id = getAttr(node, 'id');
        if (!id) {
            throw new Error('Trans-unit is not found');
        }

        let translated = findNodeByName(node, useSource ? 'source' : 'target');
        if (!translated && !useSource) {
            translated = findNodeByName(node, 'source');
        }
        if (!translated) {
            throw new Error('Source and target nodes not found');
        }

        variableValue[id] = nodesToString(translated.children || []);
    });

    const variableSet = new Set<string>();
    const m = skeletonData.match(/%%%[^%]+%%%/g);
    m?.forEach((variable) => variableSet.add(variable));

    let outMd = skeletonData;
    Object.entries(variableValue).forEach(([id, rawValue]) => {
        const variable = `%%%${id}%%%`;
        variableSet.delete(variable);
        let value = rawValue;

        const idM = /_yaml(?:_(.+))?$/.exec(id);
        if (idM) {
            const quotingType = YamlQuotingTypeQuote[idM[1] as keyof typeof YamlQuotingTypeQuote];
            value = yaml
                .dump(value, {forceQuotes: Boolean(quotingType), quotingType, lineWidth: -1})
                .trimEnd();
        }

        outMd = outMd.replace(variable, () => value);
    });

    if (variableSet.size) {
        const variables = Array.from(variableSet.keys());
        console.error('Some variables not found:', variables);
        throw new Error('Some variables not found');
    }

    return {
        document: outMd,
        variables: variableValue,
        externalFile,
        originalFile,
        sourceLanguage,
        targetLanguage,
    };
}

function nodesToString(nodes: XmlParserElementChildNode[]) {
    return nodes.map((node) => nodeToString(node)).join('');
}

function nodeToString(node: XmlParserElementChildNode): string {
    if (node.type === 'Text') {
        return unescapeXmlText(node.content);
    }
    if (node.type === 'Element') {
        if (node.name === 'x') {
            if (getAttr(node, 'ctype') === 'lb') {
                return '\n';
            }
            return getAttr(node, 'equiv-text');
        }
        if (node.name === 'g') {
            const begin = getAttr(node, 'x-begin');
            const text = nodesToString(node.children || []);
            const end = getAttr(node, 'x-end');
            return `${begin}${text}${end}`;
        }
        throw new Error(`Unsupported element name: ${node.name}`);
    }
    throw new Error(`Unsupported node type: ${node.type}`);
}

export function getAttr(node: XmlParserElementNode, attr: string) {
    let value = node.attributes[attr];
    if (typeof value !== 'undefined') {
        value = unescapeXmlText(value);
    }
    return value;
}

function findNodeByName(rooNode: XmlParserElementChildNode, name: string) {
    const next = (node: XmlParserElementChildNode): XmlParserElementNode | undefined => {
        if (node.type !== 'Element') {
            return undefined;
        }
        if (node.name === name) {
            return node;
        }
        let foundNode;
        node.children?.some((childNode) => {
            // eslint-disable-next-line callback-return
            foundNode = next(childNode);
            return Boolean(foundNode);
        });
        return foundNode;
    };
    return next(rooNode);
}

export function findNodeByNamePath(node: XmlParserElementChildNode, names: string[]) {
    let lastResult: XmlParserElementNode | undefined;
    let cursor: XmlParserElementChildNode = node;
    for (let i = 0, len = names.length; i < len; i++) {
        const name = names[i];
        lastResult = findNodeByName(cursor, name);
        if (!lastResult) {
            break;
        }
        cursor = lastResult;
    }
    return lastResult;
}
