import MarkdownIt from 'markdown-it';
import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {
    CustomRendererHooks,
    customRenderer,
    CustomRendererParams,
} from '@diplodoc/markdown-it-custom-renderer';

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

import {xlfInitState, XLFRendererState} from './state';
import hooks, {HooksParameters} from './hooks';
import {handlers} from './handlers';
import {mergeHooks} from 'src/hooks';
import rules from './rules';

import {generateTemplate, templateValidParameters, TemplateParameters} from 'src/xlf/generator';

export type RenderParameters = TemplateParameters & DiplodocParameters & BaseParameters;
export type BaseParameters = {
    markdown: string;
    hooks?: CustomRendererHooks;
};

export type DiplodocParameters = {
    lang?: string;
};

function render(parameters: RenderParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const wrapper = generateTemplate(parameters);

    const xlfRenderer = new MarkdownIt({html: true}) as HooksParameters['markdownit'];
    const xlfRules = rules.generate();
    const xlfHooks: {hooks: CustomRendererHooks} = hooks.generate({
        template: wrapper.template,
        markdownit: xlfRenderer,
    });

    const allHooks: CustomRendererHooks[] = [MarkdownRenderer.defaultHooks, xlfHooks.hooks].concat(
        parameters.hooks ?? [],
    );
    const mergedHooks = mergeHooks(...allHooks);

    const initState = () => ({
        ...xlfInitState(wrapper),
        ...xlfRules.initState(),
    });

    const xlfOptions: CustomRendererParams<XLFRendererState> = {
        rules: xlfRules.rules,
        hooks: mergedHooks,
        initState,
        handlers,
    };

    const diplodocOptions = {
        lang: parameters.lang ?? 'ru',
        path: '',
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

    return xlfRenderer.render(parameters.markdown);
}

function validParameters(parameters: RenderParameters) {
    const {lang, markdown} = parameters;

    const markdownCondition = markdown !== undefined;
    const langCondition = lang === undefined || lang === 'ru' || lang === 'en';
    const conditions = [templateValidParameters(parameters), markdownCondition, langCondition];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
