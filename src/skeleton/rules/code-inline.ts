import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {SkeletonRendererState} from 'src/skeleton/renderer';

export type CodeRuleState = {
    code: {
        fragments: Record<string, string>;
        index: number;
    };
};

function initState() {
    return {
        code: {
            fragments: {},
            index: 0,
        },
    };
}

const codeInline: Renderer.RenderRuleRecord = {
    code_inline: codeInlineRule,
};

function codeInlineRule(this: MarkdownRenderer<SkeletonRendererState>, tokens: Token[], i: number) {
    const {markup, content, type} = tokens[i];
    if (!markup?.length) {
        throw new Error(`markup missing for token: ${type}`);
    }

    this.state.code.fragments[++this.state.code.index] = content;

    return markup + `$$$code-${this.state.code.index}$$$` + markup;
}

export {codeInline, initState};
export default {codeInline};
