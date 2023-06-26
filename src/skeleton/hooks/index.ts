import {MarkdownRendererLifeCycle} from '@diplodoc/markdown-it-markdown-renderer';

import meta, {MetaParameters} from './meta';
import {includes} from './diplodoc';

export type HooksParameters = MetaParameters;

function generate(parameters: HooksParameters) {
    return {
        hooks: {
            [MarkdownRendererLifeCycle.BeforeRender]: [meta.hook(parameters), includes],
        },
    };
}

export {generate};
export default {generate};
