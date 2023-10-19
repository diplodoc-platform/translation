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

    it('renders strong wrapped in <g> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер **один**. Предложение номер **два**.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders em wrapped in <g> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер *один*. Предложение номер *два*.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders s wrapped in <g> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер ~~один~~. Предложение номер ~~два~~.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders sup wrapped in <g> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер^один^. Предложение номер^два^.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders samp wrapped in <g> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер ##один##. Предложение номер ##два##.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders code wrapped in <x> tag', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер `один`. Предложение номер `два`.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders links wrapped in <g> and <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер [один](one.md "one"). Предложение номер [два](two.md).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders ref links wrapped in <g> and <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер [{#T}](one.md "one"). Предложение номер [{#T}](two.md).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
