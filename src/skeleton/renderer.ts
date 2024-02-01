import {ok} from 'assert';
import MarkdownIt from 'markdown-it';
import {
    MarkdownRenderer,
    MarkdownRendererEnv,
    MarkdownRendererParams,
    mdRenderer,
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

import {HooksParams, HooksState, generate as generateHooks} from './hooks';
import {rules, initState as rulesInitState} from './rules';
import {mergeHooks} from 'src/utils';
import {CustomRendererHooks} from '@diplodoc/markdown-it-custom-renderer';
import {TemplateParams, XLF} from 'src/xlf';
import {LinkState} from 'src/skeleton/rules/link';
import {ImageState} from 'src/skeleton/rules/image';

export type SkeletonRendererState = HooksState & LinkState & ImageState;

export type RenderParams = BaseParams & TemplateParams & DiplodocParams;
export type BaseParams = {
    markdown: string;
    markdownPath?: string;
    skeletonPath?: string;
    hooks?: CustomRendererHooks;
};

export type DiplodocParams = {
    lang?: string;
    notesAutotitle?: boolean;
};

export function render(parameters: RenderParams) {
    validateParams(parameters);

    const {markdown} = parameters;
    const md = createRenderer(parameters);

    md.render(markdown, {
        source: markdown.split('\n'),
    });

    const state = (md.renderer as MarkdownRenderer<SkeletonRendererState>)
        .state as SkeletonRendererState;

    const xlf = XLF.generate(parameters, state.segments);

    return {skeleton: state.result, xlf, units: state.segments};
}

export function createRenderer(parameters: RenderParams) {
    const {markdown, lang} = parameters;

    const md = new MarkdownIt({html: true}) as HooksParams['markdownit'];

    const skeletonHooks = generateHooks({markdownit: md, source: markdown});
    const allHooks: CustomRendererHooks[] = [
        MarkdownRenderer.defaultHooks,
        skeletonHooks.hooks,
    ].concat(parameters.hooks ?? []);
    const mergedHooks = mergeHooks(...allHooks);

    const mdOptions: MarkdownRendererParams<HooksState> = {
        initState: () => ({
            ...skeletonHooks.initState(),
            ...rulesInitState(),
        }),
        rules,
        hooks: mergedHooks,
    };
    const diplodocOptions = {
        lang: lang ?? 'ru',
        notesAutotitle: false,
        path: '',
    };

    md.disable('reference');

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

    return md;
}

export function validateParams(parameters: RenderParams) {
    const {markdown, lang} = parameters;

    ok(markdown !== undefined, 'Markdown is empty');
    ok(lang === undefined || lang === 'ru' || lang === 'en', 'Unexpected lang');
}
