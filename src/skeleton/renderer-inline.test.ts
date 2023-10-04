import {render, RenderParameters} from './renderer';

describe('inline: skeleton rendering', () => {
    it('inline: renders hash instead of the sentences with plain text.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер один. Предложение номер два.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with links.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер один [ссылка](file.md "title"). Предложение номер два.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with bold.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер **один**. Предложение номер **два**.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with italics.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер *один*. Предложение номер *два*.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with strikethrough.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер ~~один~~. Предложение номер ~~два~~.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with superscript.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер ^один^. Предложение номер ^два^.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with monospace.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер ##один##. Предложение номер ##два##.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with inline code.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер `один`. Предложение номер `два`.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
