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

import {XLFRendererState, xlfInitState} from './state';
import hooks, {HooksParameters} from './hooks';
import {handlers} from './handlers';
import rules from './rules';

import {TemplateParameters, generateTemplate, templateValidParameters} from 'src/xlf/generator';

export type RenderParameters = TemplateParameters & DiplodocParameters & BaseParameters;
export type BaseParameters = {
    markdown: string;
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

    // todo: add non-destructive way of extending custom-renderer hooks
    for (const lifecycleHook of Object.entries(MarkdownRenderer.defaultHooks)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [lifecycle, hooks_] = lifecycleHook as any;

        const hooksForLifeCycle = xlfHooks.hooks[lifecycle];

        if (Array.isArray(hooksForLifeCycle)) {
            xlfHooks.hooks[lifecycle] = [...hooksForLifeCycle, ...hooks_];
        } else {
            xlfHooks.hooks[lifecycle] = [hooksForLifeCycle, ...hooks_];
        }
    }

    const initState = () => ({
        ...xlfInitState(wrapper),
        ...xlfRules.initState(),
    });

    const xlfOptions: CustomRendererParams<XLFRendererState> = {
        rules: xlfRules.rules,
        hooks: xlfHooks.hooks,
        initState,
        handlers,
    };

    const diplodocOptions = {
        lang: parameters.lang ?? 'ru',
        path: '',
    };

    const env: MarkdownRendererEnv = {
        source: parameters.markdown.split('\n'),
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

    return xlfRenderer.render(parameters.markdown, env);
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
