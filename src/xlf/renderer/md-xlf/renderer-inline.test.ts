import {render, RenderParameters} from './index';

const baseRendererParameters = {
    source: {
        language: 'ru',
        locale: 'RU' as const,
    },
    target: {
        language: 'en',
        locale: 'US' as const,
    },
    markdownPath: 'text.md',
    skeletonPath: 'text.skl.md',
};

describe('renders xlf from markdown', () => {
    it('renders plain text', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер один. Предложение номер два.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
