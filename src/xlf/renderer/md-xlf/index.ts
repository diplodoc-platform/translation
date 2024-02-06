import MarkdownIt from 'markdown-it';
import {
    CustomRendererHooks,
    customRenderer,
} from '@diplodoc/markdown-it-custom-renderer';
import {token} from 'src/utils';

import {hooks} from './hooks';
import {rules} from './rules';

import {generateTransUnit} from 'src/xlf/generator';
import {XLFRenderState} from './state';

export {state, XLFRenderState} from './state';

export type XLFRenderParams = DiplodocParams & BaseParams;
export type BaseParams = {
    unitId: number;
    hooks?: CustomRendererHooks;
};

export type DiplodocParams = {
    lang?: string;
};

export function render(tokens: Token[], state: XLFRenderState, parameters: XLFRenderParams) {
    const xlfRenderer = new MarkdownIt({html: true});

    xlfRenderer.use(customRenderer, {
        rules,
        hooks,
        initState: () => state,
    });

    const source = xlfRenderer.renderer.render([token('inline', {
        children: groupUselessTokens(tokens)
    })], xlfRenderer.options, {
        source: [] as string[],
    });

    return generateTransUnit({
        source,
        id: parameters.unitId,
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