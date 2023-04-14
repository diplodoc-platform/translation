import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRendererParams,
    MarkdownRendererEnv,
} from '@diplodoc/markdown-it-markdown-renderer';

import {translationHandlers} from './handlers';

export type RenderParameters = {
    skeleton: string;
    translations: Map<string, string>;
};

function render(parameters: RenderParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const md = new MarkdownIt('commonmark', {html: true});

    const {handlers, initState} = translationHandlers(parameters.translations);

    const mdOptions: MarkdownRendererParams = {
        handlers,
        initState,
    };

    const env: MarkdownRendererEnv = {
        source: parameters.skeleton.split('\n'),
    };

    md.use(mdRenderer, mdOptions);

    return md.render(parameters.skeleton, env);
}

function validParameters(parameters: RenderParameters) {
    const conditions = [parameters.skeleton !== undefined, parameters.translations !== undefined];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
