import MarkdownIt from 'markdown-it';
import {
    mdRenderer,
    MarkdownRenderer,
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
import anchors from '@doc-tools/transform/lib/plugins/anchors';
import monospace from '@doc-tools/transform/lib/plugins/monospace';
import imsize from '@doc-tools/transform/lib/plugins/imsize';
import file from '@doc-tools/transform/lib/plugins/file';
import includes from '@doc-tools/transform/lib/plugins/includes';
import tabs from '@doc-tools/transform/lib/plugins/tabs';
import video from '@doc-tools/transform/lib/plugins/video';
import table from '@doc-tools/transform/lib/plugins/table';

import skeletonHandlers from './handlers';
import hooks, {HooksParameters, HooksState} from './hooks';
import {rules} from './rules';
import {mergeHooks} from 'src/hooks';
import {CustomRendererHooks} from '@diplodoc/markdown-it-custom-renderer';

export type SkeletonRendererState = HooksState;

export type RenderParameters = BaseParameters & DiplodocParameters;
export type BaseParameters = {
    markdown: string;
    hooks?: CustomRendererHooks;
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

    const {handlers} = skeletonHandlers.generate();

    const skeletonHooks = hooks.generate({markdownit: md});

    const allHooks: CustomRendererHooks[] = [
        MarkdownRenderer.defaultHooks,
        skeletonHooks.hooks,
    ].concat(parameters.hooks ?? []);

    const mergedHooks = mergeHooks(...allHooks);

    const mdOptions: MarkdownRendererParams<HooksState> = {
        handlers,
        initState: skeletonHooks.initState,
        rules,
        hooks: mergedHooks,
    };
    const diplodocOptions = {
        lang: lang ?? 'ru',
        path: '',
    };

    // diplodoc plugins
    md.use(meta, diplodocOptions);
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
