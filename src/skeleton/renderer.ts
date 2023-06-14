import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRendererParams,
    MarkdownRendererEnv,
} from '@diplodoc/markdown-it-markdown-renderer';

// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';
// @ts-ignore
import sup from 'markdown-it-sup';
import notes from '@doc-tools/transform/lib/plugins/notes';
import cut from '@doc-tools/transform/lib/plugins/cut';
import checkbox from '@doc-tools/transform/lib/plugins/checkbox';

import skeletonHandlers, {SkeletonHandlersState} from './handlers';
import hooks, {HooksParameters} from './hooks';

export type SkeletonRendererState = SkeletonHandlersState;

export type RenderParameters = {
    markdown: string;
} & DiplodocParameters;

export type DiplodocParameters = {
    lang?: string;
};

function render(parameters: RenderParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const {markdown, lang} = parameters;

    const md = new MarkdownIt({html: true}) as HooksParameters['markdownit'];
    const env: MarkdownRendererEnv = {source: markdown.split('\n')};

    const {handlers, initState} = skeletonHandlers.generate();

    const skeletonHooks = hooks.generate({markdownit: md});
    const mdOptions: MarkdownRendererParams<SkeletonHandlersState> = {
        handlers,
        initState,
        hooks: skeletonHooks.hooks,
    };
    const diplodocOptions = {
        lang: lang ?? 'ru',
    };

    md.use(mdRenderer, mdOptions);

    // diplodoc plugins
    md.use(meta, diplodocOptions);
    md.use(notes, diplodocOptions);
    md.use(cut, diplodocOptions);
    md.use(sup, diplodocOptions);
    md.use(checkbox, diplodocOptions);

    return md.render(markdown, env);
}

function validParameters(parameters: RenderParameters) {
    const {markdown, lang} = parameters;

    const markdownCondition = markdown !== undefined;
    const langCondition = lang === undefined || lang === 'ru' || lang === 'en';
    const conditions = [markdownCondition, langCondition];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
