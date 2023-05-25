import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRendererParams,
    MarkdownRendererEnv,
} from '@diplodoc/markdown-it-markdown-renderer';

// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';
import notes from '@doc-tools/transform/lib/plugins/notes';

import markdownHandlers, {MarkdownHandlersState} from './handlers';
import hooks, {HooksParameters} from './hooks';

export type MarkdownRendererState = MarkdownHandlersState;

export type RenderParameters = {
    skeleton: string;
    translations: Map<string, string>;
} & DiplodocParameters;

export type DiplodocParameters = {
    lang?: string;
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
    const diplodocOptions = {
        lang: parameters.lang ?? 'ru',
    };

    const env: MarkdownRendererEnv = {
        source: parameters.skeleton.split('\n'),
    };

    md.use(mdRenderer, mdOptions);

    // diplodoc plugins
    md.use(meta);
    md.use(notes, diplodocOptions);

    return md.render(parameters.skeleton, env);
}

function validParameters(parameters: RenderParameters) {
    const {skeleton, translations} = parameters;

    const skeletonCondition = skeleton !== undefined;
    const translationsCondition = translations !== undefined;

    const conditions = [
        skeletonCondition,
        translationsCondition,
        validDiplodocParameters(parameters),
    ];

    return conditions.reduce((a, v) => a && v, true);
}

function validDiplodocParameters(parameters: DiplodocParameters) {
    const {lang} = parameters;

    return lang === undefined || lang === 'ru' || lang === 'en';
}

export {render, validParameters, validDiplodocParameters};
export default {render, validParameters, validDiplodocParameters};
