import MarkdownIt from 'markdown-it';
import {customRenderer, CustomRendererParams} from '@diplodoc/markdown-it-custom-renderer';

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

import {template} from './generator';
import rules, {XLFRulesState} from './rules';
import hooks, {HooksParameters} from './hooks';

export type XLFRendererState = XLFRulesState;

export type RenderParameters = {
    markdown: string;
} & template.TemplateParameters &
    DiplodocParameters;

export type DiplodocParameters = {
    lang?: string;
};

function render(parameters: RenderParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const wrapper = template.generate(parameters);

    const xlfRenderer = new MarkdownIt({html: true}) as HooksParameters['markdownit'];
    const xlfRules = rules.generate(wrapper);
    const xlfHooks = hooks.generate({template: wrapper.template, markdownit: xlfRenderer});
    const xlfOptions: CustomRendererParams<XLFRendererState> = {
        rules: xlfRules.rules,
        hooks: xlfHooks.hooks,
        initState: xlfRules.initState,
    };
    const diplodocOptions = {
        lang: parameters.lang ?? 'ru',
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

    xlfRenderer.use(customRenderer, xlfOptions);

    return xlfRenderer.render(parameters.markdown);
}

function validParameters(parameters: RenderParameters) {
    const {lang, markdown} = parameters;

    const markdownCondition = markdown !== undefined;
    const langCondition = lang === undefined || lang === 'ru' || lang === 'en';
    const conditions = [template.validParameters(parameters), markdownCondition, langCondition];

    return conditions.reduce((a, v) => a && v, true);
}

export {render, validParameters};
export default {render, validParameters};
