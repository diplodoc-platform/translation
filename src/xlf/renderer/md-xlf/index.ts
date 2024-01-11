import MarkdownIt from 'markdown-it';
import {MarkdownRenderer, MarkdownRendererEnv} from '@diplodoc/markdown-it-markdown-renderer';
import {
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
import anchors from '@diplodoc/transform/lib/plugins/anchors';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import file from '@diplodoc/transform/lib/plugins/file';
import includes from '@diplodoc/transform/lib/plugins/includes';
import tabs from '@diplodoc/transform/lib/plugins/tabs';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';

import {XLFRendererState} from './state';
import hooks from './hooks';
import {handlers} from './handlers';
import {mergeHooks} from 'src/hooks';
import rules from './rules';

import {generateTransUnit} from 'src/xlf/generator';

export type RenderParameters = DiplodocParameters & BaseParameters;
export type BaseParameters = {
    unitId: number;
    hooks?: CustomRendererHooks;
};

export type DiplodocParameters = {
    lang?: string;
};

function render(markdown: string, parameters: RenderParameters) {
    const xlfRenderer = new MarkdownIt({html: true});
    const xlfRules = rules.generate();
    const xlfHooks: {hooks: CustomRendererHooks} = hooks.generate();

    const allHooks: CustomRendererHooks[] = [MarkdownRenderer.defaultHooks, xlfHooks.hooks];
    const mergedHooks = mergeHooks(...allHooks);
    const xlfOptions: CustomRendererParams<XLFRendererState> = {
        rules: xlfRules.rules,
        hooks: mergedHooks,
        initState: xlfRules.initState,
        handlers,
    };

    const diplodocOptions = {
        lang: parameters.lang ?? 'ru',
        path: '',
        log: {
            warn: console.warn,
            error: console.error,
        }
    };

    const env: MarkdownRendererEnv = {
        source: markdown.split('\n'),
    };

    // diplodoc plugins
    xlfRenderer.use(meta);
    xlfRenderer.use(notes, diplodocOptions);
    xlfRenderer.use(cut, diplodocOptions);
    xlfRenderer.use(sup, diplodocOptions);
    xlfRenderer.use(checkbox, diplodocOptions);
    xlfRenderer.use(anchors, diplodocOptions);
    xlfRenderer.use(monospace, diplodocOptions);
    xlfRenderer.use(imsize, diplodocOptions);
    xlfRenderer.use(file, diplodocOptions);
    xlfRenderer.use(includes, diplodocOptions);
    xlfRenderer.use(tabs, diplodocOptions);
    xlfRenderer.use(video, diplodocOptions);
    xlfRenderer.use(table, diplodocOptions);

    xlfRenderer.use(customRenderer, xlfOptions);

    return generateTransUnit({
        source: xlfRenderer.render(markdown, env),
        id: parameters.unitId,
    });
}

export {render};
export default {render};
