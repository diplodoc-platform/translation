import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer';

import template, {TemplateParameters} from './template';
import meta, {MetaParameters} from './meta';
import {afterInline} from './after-inline';
import {includes} from './diplodoc/includes';

export type HooksParameters = TemplateParameters & MetaParameters;

function generate(parameters: HooksParameters) {
    return {
        hooks: {
            [CustomRendererLifeCycle.BeforeRender]: [
                template.before(parameters),
                meta.hook(parameters),
                includes,
            ],
            [CustomRendererLifeCycle.AfterRender]: [template.after(parameters)],
            [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
        },
    };
}

export {generate};
export default {generate};
