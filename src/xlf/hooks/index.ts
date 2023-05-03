import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer';

import template, {TemplateParameters} from './template';

export type HooksParameters = TemplateParameters;

function hooks(parameters: HooksParameters) {
    return {
        [CustomRendererLifeCycle.BeforeRender]: [template.before(parameters)],
        [CustomRendererLifeCycle.AfterRender]: [template.after(parameters)],
    };
}

export {hooks};
export default {hooks};
