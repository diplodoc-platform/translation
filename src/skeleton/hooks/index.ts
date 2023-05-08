import {MarkdownRendererLifeCycle} from '@diplodoc/markdown-it-markdown-renderer';

import meta, {MetaParameters} from './meta';

export type HooksParameters = MetaParameters;

function generate(parameters: HooksParameters) {
    return {
        hooks: {
            [MarkdownRendererLifeCycle.BeforeRender]: [meta.hook(parameters)],
        },
    };
}

export {generate};
export default {generate};
