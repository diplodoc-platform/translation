import {render, RenderParameters} from './renderer';

describe('inline: skeleton rendering', () => {
    it('inline: renders hash instead of the sentences with plain text.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер один. Предложение номер два.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with strong syntax.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер **один**. Предложение номер **два**.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with em syntax.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер *один*. Предложение номер *два*.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with s syntax.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер ~~один~~. Предложение номер ~~два~~.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with sup syntax.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер^один^. Предложение номер^два^.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with samp syntax.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер ##один##. Предложение номер ##два##.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with code syntax.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер `один`. Предложение номер `два`.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with links syntax.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Предложение номер [один](one.md "one"). Предложение номер [два](two.md "two").',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with ref links syntax.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер [{#T}](one.md "one"). Предложение номер [{#T}](two.md).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with autolink syntax.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Предложение номер один <https://www.google.com>. Предложение номер два <https://www.youtube.com>.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with variable href link syntax.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Предложение номер [один]({{one}} "title"). Предложение номер [два]({{two}}).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
