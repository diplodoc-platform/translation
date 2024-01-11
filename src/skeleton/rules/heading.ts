import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

export type HeadingState = {
    code: {
        pending: Array<Token>;
        fragments: Record<string, string>;
        index: number;
    };
};

function initState() {
    return {
        heading: {
            pending: new Array<Token>(),
            fragments: {},
            index: 0,
        },
    };
}

// TODO: это неправильная реализация, ее нужно выкинуть
// Вместо этого нужно переписать плагин anchors
// Нужно на этапе парсинга не генерировать вложенные токены link,
// а добавлять мета информацию про якоря в токен хедера.
// От контента при этом якоря нужно отрезать.
// В md-renderer нужно учесть эту специфику и порендерить якоря обратно.
// Таким образом якоря не нужно будет ни во что заворачивать - они просто не отправятся на перевод.
const heading: Renderer.RenderRuleRecord = {
    heading_open: function (this: MarkdownRenderer<HeadingState>, tokens: Token[], i: number) {
        const {markup} = tokens[i];

        let rendered = '';

        if (i) {
            rendered += this.EOL;
        }

        rendered += this.renderContainer(tokens[i]);

        if (i) {
            rendered += this.EOL;
        }

        const headingBody = tokens[i + 1];
        const headingText = headingBody.children[0];
        headingText.isHeading = markup;

        // handle atx headings
        if (!isSetexHeading(tokens[i])) {
            rendered += markup + this.SPACE;
            return rendered;
        }

        this.state.heading.pending.push(tokens[i]);

        const previous = tokens[i - 1];
        if (previous?.type === 'paragraph_close') {
            rendered += this.EOL;
        }

        return rendered;
    },
};

function isSetexHeading(token: Token) {
    const {markup} = token;

    return markup.indexOf('=') !== -1 || markup.indexOf('-') !== -1;
}

export {heading, initState};
export default {heading, initState};
