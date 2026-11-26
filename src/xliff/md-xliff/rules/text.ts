import type {Renderer} from 'markdown-it';

export const text: Renderer['rules'] = {
    text: function (tokens: Token[], i: number) {
        const text = tokens[i];

        if (!text.content?.length || text.reflink) {
            return '';
        }

        return text.content;
    },
};
