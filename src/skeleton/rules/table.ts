import type Renderer from 'markdown-it/lib/renderer';

function escapeMarkupLikeChars(tokens: Token[], idx: number) {
    const inline = tokens[idx + 1];
    if (inline && inline.children?.length) {
        for (let i = 0; i < inline.children.length; i++) {
            const token = inline.children[i];

            if (token.type === 'text' || token.type === 'code_inline') {
                token.content = token.content.replace(/\|/g, '\\|');
            }
        }
    }

    return '';
}

export const table: Renderer.RenderRuleRecord = {
    th_open: escapeMarkupLikeChars,
    td_open: escapeMarkupLikeChars,
};
