import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRendererParams,
    MarkdownRendererEnv,
} from '@diplodoc/markdown-it-markdown-renderer';

import skeletonHandlers, {SkeletonHandlersState} from './handlers';

export type RenderParameters = {
    markdown: string;
};

function render(parameters: RenderParameters) {
    const {markdown} = parameters;

    const md = new MarkdownIt('commonmark', {html: true});
    const env: MarkdownRendererEnv = {source: markdown.split('\n')};

    const {handlers, initState} = skeletonHandlers.generate();

    const mdOptions: MarkdownRendererParams<SkeletonHandlersState> = {
        handlers,
        initState,
    };

    md.use(mdRenderer, mdOptions);

    return md.render(markdown, env);
}

function validParameters(parameters: RenderParameters) {
    const conditions = [parameters.markdown !== undefined];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
