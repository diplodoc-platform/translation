import {MarkdownRendererLifeCycle} from '@diplodoc/markdown-it-markdown-renderer';

import {MetaParams, hook as meta} from './meta';
import {AfterInlineState, AfterInlineStateParams, afterInline, initState} from './after-inline';
import {beforeInline} from './before-inline';
import {includes} from './diplodoc';

export type HooksState = AfterInlineState;
export type HooksParams = MetaParams;

export function generate(parameters: HooksParams & AfterInlineStateParams) {
    return {
        hooks: {
            [MarkdownRendererLifeCycle.BeforeRender]: [meta(parameters), includes],
            [MarkdownRendererLifeCycle.AfterInlineRender]: [afterInline],
            [MarkdownRendererLifeCycle.BeforeInlineRender]: [beforeInline],
        },
        initState: initState(parameters),
    };
}
