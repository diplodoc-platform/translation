import type Renderer from 'markdown-it/lib/renderer';

export const text: Renderer.RenderRuleRecord = {
    text: function(tokens: Token[], i: number) {
        const text = tokens[i];

        if (!text.content?.length || text.reflink) {
            return '';
        }

        return text.content;
    },
};
