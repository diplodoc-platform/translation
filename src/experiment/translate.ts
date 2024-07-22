import yaml from 'js-yaml';
import xmlParser, {XmlParserElementChildNode, XmlParserElementNode} from 'xml-parser-xo';

import {YamlQuotingTypeQuote} from './constants';
import {unescapeXmlText} from './xliff/utils';
import {ComposeOptions} from 'src/experiment/adapter/types';

/* eslint-disable no-console */

export function translate(xliffData: string, skeletonData: string, options?: ComposeOptions) {
  const {useSource} = options ?? {};
  const xliff = xmlParser(xliffData, {
    strictMode: true,
  });

  let relSkeletonPath: string | undefined;

  const body = findNodeByName(xliff.root, 'body');
  if (!body) {
    throw new Error('Body is not found');
  }

  const variableValue: Record<string, string> = {};

  body.children?.forEach((node) => {
    if (node.type !== 'Element') return;
    if (node.name !== 'trans-unit') return;

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

  return {document: outMd, variables: variableValue, relSkeletonPath};
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

function getAttr(node: XmlParserElementNode, attr: string) {
  let value = node.attributes[attr];
  if (typeof value !== 'undefined') {
    value = unescapeXmlText(value);
  }
  return value;
}

function findNodeByName(rooNode: XmlParserElementChildNode, name: string) {
  const next = (node: XmlParserElementChildNode): XmlParserElementNode | undefined => {
    if (node.type !== 'Element') return undefined;
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
