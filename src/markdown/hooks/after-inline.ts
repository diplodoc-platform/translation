import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';
import {replacer} from 'src/markdown/replacer';

import {MarkdownRendererState} from 'src/markdown/renderer';
export type AfterInlineState = {
    markdown: {
        id: number;
        translations: Map<string, string>;
    };
};

export type AfterInlineParameters = {
    translations: Map<string, string>;
};

function afterInline(
    this: MarkdownRenderer<MarkdownRendererState>,
    parameters: CustomRendererHookParameters,
) {
    if (!parameters.rendered) {
        return '';
    }

    const artifact = parameters.rendered.join('');
    if (!artifact.length) {
        return '';
    }

    const replaced = replacer(artifact, this.state);

    parameters.rendered.splice(0, parameters.rendered.length, replaced);

    return '';
}

function initState(parameters: AfterInlineParameters): () => AfterInlineState {
    const {translations} = parameters;

    return () => ({
        markdown: {
            translations,
            id: 1,
        },
    });
}

export {afterInline, initState};
export default {afterInline, initState};
