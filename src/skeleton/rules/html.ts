import type {RenderRuleRecord} from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';
import type {HTMLElement, Node, TextNode} from 'node-html-parser';
import {NodeType, parse} from 'node-html-parser';
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
    'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em',
    'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'output', 'q',
    'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var'
];
function isInline(node: Node): boolean {
    return isText(node) || isElement(node) && inline.includes(node.tagName.toLowerCase()) && node.childNodes.every(isInline);
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

    return [
        token('skip', {skip: '<' + node.rawTagName}),
        token('skip', {skip: '>'})
    ];
}

function close(node: Node): Token[] {
    if (!isElement(node)) {
        return [];
    }

    return [
        token('skip', {skip: '</' + node.rawTagName + '>'})
    ];
}

export const html: RenderRuleRecord = {
    html_block: function(this: CustomRenderer<Consumer>, tokens, idx) {
        const root = parse(tokens[idx].content);
        const process = (parts: Token[]) => this.state.process(parts, tokens[idx].map);

        function handleContainer(node: Node) {
            if (isIgnore(node)) {
                return;
            }

            if (isText(node)) {
                process(handleInline(node));
                return;
            }

            const box = node as HTMLElement;
            process(open(box));

            let inline = [];
            for (const child of box.childNodes) {
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
                return [
                    token('text', {content: node.innerText})
                ];
            }

            if (!node.childNodes.length) {
                return [];
            }

            return [
                ...open(node),
                ...flat((node.childNodes as (HTMLElement | TextNode)[]).map(handleInline)),
                ...(isVoid(node) ? [] : close(node)),
            ]
        }

        root.childNodes.forEach(handleContainer);

        return '';
    },
};