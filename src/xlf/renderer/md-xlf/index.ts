import MarkdownIt from 'markdown-it';
import {
    CustomRendererHooks,
    CustomRendererParams,
    customRenderer,
} from '@diplodoc/markdown-it-custom-renderer';

import hooks from './hooks';
import {mergeHooks} from 'src/utils';
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
    const xlfHooks: {hooks: CustomRendererHooks} = hooks.generate();
    const xlfOptions: CustomRendererParams<XLFRenderState> = {
        rules: rules(),
        hooks: xlfHooks.hooks,
        initState: () => state,
    };

    const env = {
        source: [] as string[],
    };

    xlfRenderer.use(customRenderer, xlfOptions);

    // console.log(tokens[0].children);

    const source = xlfRenderer.renderer.render(tokens, xlfRenderer.options, env);

    return generateTransUnit({
        source,
        id: parameters.unitId,
    });
}
