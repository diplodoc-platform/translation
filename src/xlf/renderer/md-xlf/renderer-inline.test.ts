import {RenderParameters, render} from './index';

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

    it('renders plain text sentences separated by newline', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер один.\nПредложение номер два.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders strong wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер **один**. Предложение номер **два**.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders em wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер *один*. Предложение номер *два*.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders s wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер ~~один~~. Предложение номер ~~два~~.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders sup wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер^один^. Предложение номер^два^.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders samp wrapped in <x> tags', () => {
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

    it('renders links wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер [один](one.md "one"). Предложение номер [два](two.md).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders ref links wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер [{#T}](one.md "one"). Предложение номер [{#T}](two.md).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders autolink wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Предложение номер один <https://www.google.com>. Предложение номер два <https://www.youtube.com>.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders variable href link wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Предложение номер [один]({{one}} "one"). Предложение номер [два]({{two}}).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders link with multiple sentences inside text part and title part wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                '[Link text sentence one! Link text sentence Two?](file.md "Link title sentence one. Link title sentence two!")',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders image all attributes wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence ![image](image.png "hint" =100x100). Sentence ![image](image.png "hint" =x100). Sentence ![image](image.png "hint" =100x). Sentence ![image](image.png =100x100). Sentence ![image](image.png "hint"). Sentence ![image](image.png). Sentence ![]().',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders video wrapped in <x> tag', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence goes here. Another sentence @[youtube](https://youtu.be/rJz4OaURJ6U)',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders heading with anchors wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: '# Heading with anchors {#anchor1} {#anchor2}',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders file wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence with {% file src="path/to/file" name="readme.md" referrerpolicy="no-referrer" rel="noopener" target="_blank" type="text/plain" %}.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid conditions wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence with {% if var == "val" %} val {% else %} other val {% endif %}. {% if var == "val" %} A {% else %} B {% endif %} Point.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid loops wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence {% for x in xs %} x {% endfor %}. {% for x in xs %} X {% endfor %} cool.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid functions wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence with function {{ user.name.slice(1, 2) }}. {{ user.name.slice(1, 2) }} starts with function.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid filters wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence with filter {{ users | length }}. {{user | capitalize}} starts with filter.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid variables wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Sentence with {{ variable }}. {{variable}} sentence.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders html wrapped in <x> tags', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: 'Sentence<br>with <b>html</b>.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid filters wrapped in <x> tags inside tables', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: `\
#|
|| Heading one | Heading two ||
|| Cell with {{ variable | length }} | Cell with {{ variable }} ||
|#`,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders sentences with abbreviations inside parenthesis', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown: `Sentence (см. [link](file.md)) continues. Another sentence.`,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders sentences with inline code that has liquid syntax inside', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Sentence `{{ ui-key.yacloud.common.label_tcp }} other`. Another sentence `{{user.name | capitalize}} other`.',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders sentences with links in the end', () => {
        const parameters: RenderParameters = {
            ...baseRendererParameters,
            markdown:
                'Инструкция содержит информацию о создании и настройке [группы рабочих столов](concepts/desktops-and-groups.md). Если вы получили от администратора ссылку на [витрину пользовательских рабочих столов](concepts/showcase.md), перейдите к подразделу [{#T}](#get-credentials).',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
