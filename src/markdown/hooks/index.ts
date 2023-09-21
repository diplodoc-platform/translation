import {MarkdownRendererLifeCycle} from '@diplodoc/markdown-it-markdown-renderer';

import {afterInline, initState, AfterInlineParameters, AfterInlineState} from './after-inline';
import meta, {MetaParameters} from './meta';
import {includes} from './diplodoc/includes';

export type HooksParameters = MetaParameters & AfterInlineParameters;
export type HooksState = AfterInlineState;

function generate(parameters: HooksParameters) {
    return {
        hooks: {
            [MarkdownRendererLifeCycle.BeforeRender]: [meta.hook(parameters), includes],
            [MarkdownRendererLifeCycle.AfterInlineRender]: [afterInline],
        },
        initState: initState(parameters),
    };
}

export {generate};
export default {generate};
