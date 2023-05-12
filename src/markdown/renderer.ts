import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRendererParams,
    MarkdownRendererEnv,
} from '@diplodoc/markdown-it-markdown-renderer';

// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';

import markdownHandlers, {MarkdownHandlersState} from './handlers';
import hooks, {HooksParameters} from './hooks';

export type MarkdownRendererState = MarkdownHandlersState;

export type RenderParameters = {
    skeleton: string;
    translations: Map<string, string>;
};

function render(parameters: RenderParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const md = new MarkdownIt('commonmark', {html: true}) as HooksParameters['markdownit'];

    const {handlers, initState} = markdownHandlers.generate(parameters);
    const markdownHooks = hooks.generate({markdownit: md});
    const mdOptions: MarkdownRendererParams<MarkdownHandlersState> = {
        handlers,
        initState,
        hooks: markdownHooks.hooks,
    };

    const env: MarkdownRendererEnv = {
        source: parameters.skeleton.split('\n'),
    };

    md.use(mdRenderer, mdOptions);
    md.use(meta);

    return md.render(parameters.skeleton, env);
}

function validParameters(parameters: RenderParameters) {
    const conditions = [parameters.skeleton !== undefined, parameters.translations !== undefined];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
