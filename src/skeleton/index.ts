import {ok} from 'assert';
import MarkdownIt from 'markdown-it';
import {
    CustomRenderer,
    CustomRendererHooks,
    CustomRendererParams,
    customRenderer,
} from '@diplodoc/markdown-it-custom-renderer';

// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';
// @ts-ignore
import sup from 'markdown-it-sup';
import notes from '@diplodoc/transform/lib/plugins/notes';
import cut from '@diplodoc/transform/lib/plugins/cut';
import checkbox from '@diplodoc/transform/lib/plugins/checkbox';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import file from '@diplodoc/transform/lib/plugins/file';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';
import includes from './plugins/includes';

import { HooksState, MarkdownItWithMeta, hooks, initState as hooksInitState } from './hooks';
import {rules, initState as rulesInitState} from './rules';
import {TemplateParams, XLF} from 'src/xliff';
import {LinkState} from 'src/skeleton/rules/link';

export type SkeletonRendererState = HooksState & LinkState;

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

type Renderer = CustomRenderer<SkeletonRendererState>;

export function render(parameters: RenderParams) {
    validateParams(parameters);

    const {markdown, lang} = parameters;
    const md = new MarkdownIt({html: true}) as MarkdownItWithMeta;

    const mdOptions: CustomRendererParams<SkeletonRendererState> = {
        initState: () => ({
            ...hooksInitState(markdown, md),
            ...rulesInitState(),
        }),
        rules,
        hooks,
    };
    const diplodocOptions = {
        lang: lang ?? 'ru',
        notesAutotitle: false,
        path: '',
    };

    md.disable('reference');
    md.disable('text_join');
    md.disable('entity');

    md.normalizeLink = (a: string) => a;
    md.normalizeLinkText = (a: string) => a;

    // diplodoc plugins
    md.use(meta, diplodocOptions);
    md.use(includes, diplodocOptions);
    md.use(notes, diplodocOptions);
    md.use(cut, diplodocOptions);
    md.use(sup, diplodocOptions);
    md.use(checkbox, diplodocOptions);
    md.use(monospace, diplodocOptions);
    md.use(imsize, diplodocOptions);
    md.use(file, diplodocOptions);
    md.use(video, diplodocOptions);
    md.use(table, diplodocOptions);

    md.use(customRenderer, mdOptions);

    md.render(markdown, {
        source: markdown.split('\n'),
    });

    const state = (md.renderer as unknown as Renderer).state;
    const xliff = XLF.generate(parameters, state.segments);

    return {skeleton: state.result, xliff, units: state.segments};
}

export function validateParams(parameters: RenderParams) {
    const {markdown} = parameters;

    ok(markdown !== undefined, 'Markdown is empty');
}
