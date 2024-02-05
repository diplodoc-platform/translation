import MarkdownIt from 'markdown-it';
import {
    CustomRendererHooks,
    customRenderer,
} from '@diplodoc/markdown-it-custom-renderer';

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
        rules: rules(),
        hooks,
        initState: () => state,
    });

    const source = xlfRenderer.renderer.render(tokens, xlfRenderer.options, {
        source: [] as string[],
    });

    return generateTransUnit({
        source,
        id: parameters.unitId,
    });
}
