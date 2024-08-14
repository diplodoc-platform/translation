import MarkdownIt from 'markdown-it';

import {customRenderer} from 'src/renderer';
import {token} from 'src/utils';
import {transunit} from 'src/xliff/generator';

import {hooks} from './hooks';
import {rules} from './rules';

export function render(tokens: Token[], unitId: number) {
    const xliffRenderer = new MarkdownIt({html: true});

    xliffRenderer.use(customRenderer, {rules, hooks});

    const source = xliffRenderer.renderer.render(
        [
            token('inline', {
                children: groupUselessTokens(tokens),
            }),
        ],
        xliffRenderer.options,
        {},
    );

    return transunit({
        source,
        id: unitId,
    });
}

function groupUselessTokens(tokens: Token[]) {
    const map: Record<string, Token[]> = {};
    const result = [];

    for (const part of tokens) {
        if (!part.content) {
            const [name, type] = part.type.split('_');
            if (type === 'open') {
                map[part.type] = map[part.type] || [];
                map[part.type].push(part);
            } else if (type === 'close') {
                map[name + '_open'] = map[name + '_open'] || [];
                const opener = map[name + '_open'].pop();

                if (opener) {
                    opener.g = part;
                    part.g = opener;
                }
            }
        }

        result.push(part);
    }

    return result;
}
