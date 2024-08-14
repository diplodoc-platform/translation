import type {RenderRuleRecord} from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {HTMLElement, Node, TextNode} from 'node-html-parser';
import {NodeType, parse} from 'node-html-parser';
import {Liquid} from 'src/skeleton/liquid';
import {Consumer} from 'src/consumer';
import {token} from 'src/utils';

function isText(node: Node): node is TextNode {
  return node.nodeType === NodeType.TEXT_NODE;
}

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === NodeType.ELEMENT_NODE;
}

const ignore = ['script', 'style'];
function isIgnore(node: Node) {
  return isElement(node) && ignore.includes(node.tagName.toLowerCase());
}

const inline = [
  'a',
  'abbr',
  'acronym',
  'b',
  'bdo',
  'big',
  'br',
  'button',
  'cite',
  'code',
  'dfn',
  'em',
  'i',
  'img',
  'input',
  'kbd',
  'label',
  'map',
  'object',
  'output',
  'q',
  'samp',
  'script',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'textarea',
  'time',
  'tt',
  'var',
];
function isInline(node: Node): boolean {
  return (
    isText(node) ||
    (isElement(node) &&
      inline.includes(node.tagName.toLowerCase()) &&
      node.childNodes.every(isInline))
  );
}

function isBlock(node: Node): node is HTMLElement {
  return isElement(node) && !isInline(node);
}

function isVoid(node: Node): node is HTMLElement {
  return isElement(node) && node.isVoidElement;
}

function flat(tokens: Token[] | Token[][]): Token[] {
  return ([] as Token[]).concat(...tokens);
}

function open(node: Node): Token[] {
  if (!isElement(node)) {
    return [];
  }

  const skip = ['<', node.rawTagName, node.rawAttrs, '>'];

  skip.toString = () => '<' + skip[1] + (skip[2].length ? ' ' + skip[2] : '') + '>';

  return [token('html_inline', {skip, tag: node.rawTagName, role: 'open'})];
}

function close(node: Node): Token[] {
  if (!isElement(node)) {
    return [];
  }

  const skip = ['</', node.rawTagName, '>'];

  skip.toString = () => '</' + skip[1] + '>';

  return [token('html_inline', {skip, tag: node.rawTagName, role: 'close'})];
}

export const html: RenderRuleRecord = {
  html_inline: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
    const root = tokens[idx];
    root.skip = Liquid.unescape(root.content);
    root.content = '';

    return '';
  },
  html_block: function (this: CustomRenderer<Consumer>, tokens, idx) {
    tokens[idx].content = Liquid.unescape(tokens[idx].content);
    const root = parse(tokens[idx].content);
    const process = (parts: Token[]) => this.state.process(parts, tokens[idx].map);
    const compact = this.state.compact;

    this.state.compact = true;

    function handleContainer(node: Node) {
      if (isIgnore(node)) {
        return;
      }

      if (isText(node)) {
        process(handleInline(node));
        return;
      }

      process(open(node as HTMLElement));

      let inline = [];
      for (const child of node.childNodes) {
        if (isInline(child)) {
          inline.push(...handleInline(child));
        }

        if (isBlock(child)) {
          if (inline.length) {
            process(inline);
            inline = [];
          }

          handleContainer(child);
        }
      }

      if (inline.length) {
        process(inline);
      }
    }

    function handleInline(node: Node): Token[] {
      if (isText(node)) {
        return new Liquid(node.innerText).tokenize();
      }

      if (!node.childNodes.length) {
        return [];
      }

      return [
        ...open(node),
        ...flat((node.childNodes as (HTMLElement | TextNode)[]).map(handleInline)),
        ...(isVoid(node) ? [] : close(node)),
      ];
    }

    root.childNodes.forEach(handleContainer);

    this.state.compact = compact;

    return '';
  },
};
