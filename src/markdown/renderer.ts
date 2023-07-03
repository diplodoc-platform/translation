import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRendererParams,
    MarkdownRendererEnv,
    MarkdownRenderer,
} from '@diplodoc/markdown-it-markdown-renderer';

// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';
// @ts-ignore
import sup from 'markdown-it-sup';
import notes from '@doc-tools/transform/lib/plugins/notes';
import cut from '@doc-tools/transform/lib/plugins/cut';
import checkbox from '@doc-tools/transform/lib/plugins/checkbox';
import anchors from '@doc-tools/transform/lib/plugins/anchors';
import monospace from '@doc-tools/transform/lib/plugins/monospace';
import imsize from '@doc-tools/transform/lib/plugins/imsize';
import file from '@doc-tools/transform/lib/plugins/file';
import includes from '@doc-tools/transform/lib/plugins/includes';
import tabs from '@doc-tools/transform/lib/plugins/tabs';

import markdownHandlers, {MarkdownHandlersState} from './handlers';
import hooks, {HooksParameters} from './hooks';
import {rules} from './rules';

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

    const md = new MarkdownIt({html: true}) as HooksParameters['markdownit'];

    const {handlers, initState} = markdownHandlers.generate(parameters);
    const markdownHooks = hooks.generate({markdownit: md});

    // todo: add non-destructive way of extending markdown-renderer hooks
    for (const defaultHook of Object.entries(MarkdownRenderer.defaultHooks)) {
        const [lifecycle, hooks_] = defaultHook as any;

        if (markdownHooks.hooks[lifecycle]) {
            markdownHooks.hooks[lifecycle] = [...markdownHooks.hooks[lifecycle], ...hooks_];
        }
    }

    const mdOptions: MarkdownRendererParams<MarkdownHandlersState> = {
        handlers,
        initState,
        hooks: markdownHooks.hooks,
        rules,
    };
    const diplodocOptions = {
        lang: parameters.lang ?? 'ru',
        path: '',
    };

    const env: MarkdownRendererEnv = {
        source: parameters.skeleton.split('\n'),
    };

    // diplodoc plugins
    md.use(meta);
    md.use(notes, diplodocOptions);
    md.use(cut, diplodocOptions);
    md.use(sup, diplodocOptions);
    md.use(checkbox, diplodocOptions);
    md.use(anchors, diplodocOptions);
    md.use(monospace, diplodocOptions);
    md.use(imsize, diplodocOptions);
    md.use(file, diplodocOptions);
    md.use(includes, diplodocOptions);
    md.use(tabs, diplodocOptions);

    md.use(mdRenderer, mdOptions);

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
