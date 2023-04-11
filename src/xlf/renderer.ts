import MarkdownIt from 'markdown-it';
import {customRenderer} from '@diplodoc/markdown-it-custom-renderer';

import template, {WrapperParameters} from './template';
import {rules} from './rules';
import {hooks} from './hooks';

export type RenderParameters = {
    markdown: string;
} & WrapperParameters;

function render(parameters: RenderParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const wrapper = template.generate(parameters);

    const xlfRenderer = new MarkdownIt('commonmark', {html: true});

    const xlfOptions = {
        rules: rules(),
        hooks: hooks({template: wrapper.template}),
    };

    xlfRenderer.use(customRenderer, xlfOptions);

    return xlfRenderer.render(parameters.markdown);
}

function validParameters(parameters: RenderParameters) {
    const conditions = [template.validParameters(parameters), parameters.markdown !== undefined];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
