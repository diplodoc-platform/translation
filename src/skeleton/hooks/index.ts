import {MarkdownRendererLifeCycle} from '@diplodoc/markdown-it-markdown-renderer';

import meta, {MetaParameters} from './meta';
import {afterInline, AfterInlineState, initState} from './after-inline';
import {includes} from './diplodoc';

export type HooksState = AfterInlineState;
export type HooksParameters = MetaParameters;

function generate(parameters: HooksParameters) {
    return {
        hooks: {
            [MarkdownRendererLifeCycle.BeforeRender]: [meta.hook(parameters), includes],
            [MarkdownRendererLifeCycle.AfterInlineRender]: [afterInline],
        },
        initState: initState(),
    };
}

export {generate};
export default {generate};
