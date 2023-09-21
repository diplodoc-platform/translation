import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';
import {replacer} from 'src/skeleton/replacer';

export type AfterInlineState = {
    skeleton: {
        id: number;
    };
};

function afterInline(
    this: MarkdownRenderer<AfterInlineState>,
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

function initState() {
    return () => ({
        skeleton: {
            id: 1,
        },
    });
}

export {afterInline, initState};
export default {afterInline, initState};
