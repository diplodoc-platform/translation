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
import notes from '@diplodoc/transform/lib/plugins/notes';
import cut from '@diplodoc/transform/lib/plugins/cut';
import checkbox from '@diplodoc/transform/lib/plugins/checkbox';
import anchors from '@diplodoc/transform/lib/plugins/anchors';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import file from '@diplodoc/transform/lib/plugins/file';
import includes from '@diplodoc/transform/lib/plugins/includes';
import tabs from '@diplodoc/transform/lib/plugins/tabs';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';

import markdownHandlers from './handlers';
import hooks, {HooksParameters, HooksState} from './hooks';
import {rules} from './rules';
import {mergeHooks} from 'src/hooks';
import {CustomRendererHooks} from '@diplodoc/markdown-it-custom-renderer';

export type MarkdownRendererState = HooksState;

export type RenderParameters = BaseParameters & DiplodocParameters;
export type BaseParameters = {
    skeleton: string;
    translations: Map<string, string>;
    hooks?: CustomRendererHooks;
} & DiplodocParameters;

export type DiplodocParameters = {
    lang?: string;
};

function render(parameters: RenderParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const md = new MarkdownIt({html: true}) as HooksParameters['markdownit'];

    const {handlers} = markdownHandlers.generate();
    const markdownHooks = hooks.generate({...parameters, markdownit: md});

    const allHooks = [MarkdownRenderer.defaultHooks, markdownHooks.hooks].concat(
        parameters.hooks ?? [],
    );
    const mergedHooks = mergeHooks(...allHooks);

    const mdOptions: MarkdownRendererParams<MarkdownRendererState> = {
        handlers,
        hooks: mergedHooks,
        initState: markdownHooks.initState,
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
    md.use(video, diplodocOptions);
    md.use(table, diplodocOptions);

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
