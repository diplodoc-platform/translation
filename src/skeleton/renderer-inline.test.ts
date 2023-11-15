import {RenderParameters, render} from './renderer';

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

    it('inline: renders hash instead of the sentences with image syntax.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Sentence ![image](_images/image.png "текст_подсказки" =100x100). Sentence ![image](_images/image.png "текст_подсказки" =x100). Sentence ![image](_images/image.png "текст_подсказки" =100x). Sentence ![image](_images/image.png =100x100). Sentence ![image](_images/image.png). []().',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with video syntax.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Sentence goes here. Another sentence @[youtube](https://youtu.be/rJz4OaURJ6U)',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with anchor heading syntax.', () => {
        const parameters: RenderParameters = {
            markdown:
                '# Heading with multiple anchors {#anchor1} {#anchor2}\n\n## Heading without anchor',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with file syntax.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Sentence with {% file src="path/to/file" name="readme.md" referrerpolicy="no-referrer" rel="noopener" target="_blank" type="text/plain" %}. Another sentence.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid conditions.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Sentence with {% if var == "val" %} val {% else %} other val {% endif %}. {% var == "val" %} A {% else %} B {% endif %} Point.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid loops.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Sentence {% for x in xs %} x {% endfor %}. {% for x in xs %} X {% endfor %} cool.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid functions.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Sentence with function {{ user.name.slice(1, 2) }}. {{ user.name.slice(1, 2) }} starts with function.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid filters.', () => {
        const parameters: RenderParameters = {
            markdown:
                'Sentence with function {{ users | length }}. {{user | capitalize}} Functions are cool.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid variables.', () => {
        const parameters: RenderParameters = {
            markdown: 'Sentence with {{ variables }}. {{variable}} sentence.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
