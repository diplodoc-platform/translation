import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer';
import {MetaParams, hook as meta} from './meta';
import {AfterInlineState, AfterInlineStateParams, afterInline, initState} from './after-inline';
import {beforeInline} from './before-inline';
import {image} from './image';
import {includes} from './includes';

export type HooksState = AfterInlineState;
export type HooksParams = MetaParams;

export function generate(parameters: HooksParams & AfterInlineStateParams) {
    return {
        hooks: {
            [CustomRendererLifeCycle.BeforeRender]: [image, meta(parameters), includes],
            [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
            [CustomRendererLifeCycle.BeforeInlineRender]: [beforeInline],
        },
        initState: initState(parameters),
    };
}
