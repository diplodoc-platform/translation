import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRendererParams,
    MarkdownRendererEnv,
} from '@diplodoc/markdown-it-markdown-renderer';

// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';

import skeletonHandlers, {SkeletonHandlersState} from './handlers';
import hooks, {HooksParameters} from './hooks';

export type RenderParameters = {
    markdown: string;
};

function render(parameters: RenderParameters) {
    const {markdown} = parameters;

    const md = new MarkdownIt('commonmark', {html: true}) as HooksParameters['markdownit'];
    const env: MarkdownRendererEnv = {source: markdown.split('\n')};

    const {handlers, initState} = skeletonHandlers.generate();

    const skeletonHooks = hooks.generate({markdownit: md});
    const mdOptions: MarkdownRendererParams<SkeletonHandlersState> = {
        handlers,
        initState,
        hooks: skeletonHooks.hooks,
    };

    md.use(mdRenderer, mdOptions);
    md.use(meta);

    return md.render(markdown, env);
}

function validParameters(parameters: RenderParameters) {
    const conditions = [parameters.markdown !== undefined];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
