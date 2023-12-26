import {RenderParameters, render} from './renderer';

describe('inline: renders translated markdown', () => {
    it('inline: renders sentences with plain text', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number one.'],
                ['2', 'Sentence number two.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with plain text, separated by newline', () => {
        const parameters: RenderParameters = {
            skeleton: `%%%1%%%\n%%%2%%%`,
            translations: new Map<string, string>([
                ['1', 'Sentence number one.'],
                ['2', 'Sentence number two.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with strong syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number **one**.'],
                ['2', 'Sentence number **two**.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with em syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number *one*.'],
                ['2', 'Sentence number *two*.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with s syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number ~~one~~.'],
                ['2', 'Sentence number ~~two~~.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with sup syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number^one^.'],
                ['2', 'Sentence number^two^.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with samp syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number ##one##.'],
                ['2', 'Sentence number ##two##.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with code syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number `one`.'],
                ['2', 'Sentence number `two`.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with links syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number [one](one.md "one").'],
                ['2', 'Sentence number [two](two.md "two").'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with ref links syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number [{#T}](one.md "one").'],
                ['2', 'Sentence number [{#T}](two.md).'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with autolink syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number one <https://www.google.com>.'],
                ['2', 'Sentence number two <https://www.youtube.com>.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with variale href link syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number [one]({{one}}).'],
                ['2', 'Sentence number [two]({{ two }}).'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with variale image syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%% %%%3%%% %%%4%%% %%%5%%% %%%6%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence ![image](_images/image.png "текст_подсказки" =100x100).'],
                ['2', 'Sentence ![image](_images/image.png "текст_подсказки" =x100).'],
                ['3', 'Sentence ![image](_images/image.png "текст_подсказки" =100x).'],
                ['4', 'Sentence ![image](_images/image.png =100x100).'],
                ['5', 'Sentence ![image](_images/image.png).'],
                ['6', 'Sentence ![]().'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with video syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence goes here.'],
                ['2', 'Another sentence @[youtube](https://youtu.be/rJz4OaURJ6U)'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with anchor heading syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', '# Heading with multiple anchors {#anchor1} {#anchor2}'],
                ['2', '## Heading without anchor'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with file syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                [
                    '1',
                    'Sentence with {% file src="path/to/file" name="readme.md" referrerpolicy="no-referrer" rel="noopener" target="_blank" type="text/plain" %}.',
                ],
                ['2', 'Another sentence.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with liquid conditions', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence with {% if var == "val" %} val {% else %} other val {% endif %}.'],
                ['2', '{% var == "val" %} A {% else %} B {% endif %} Point.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with liquid for loop', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence {% for x in xs %} x {% endfor %}.'],
                ['2', '{% for x in xs %} X {% endfor %} cool.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with liquid functions', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence with function {{ user.name.slice(1, 2) }}.'],
                ['2', '{{ user.name.slice(1, 2) }} Functions are cool.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with liquid filters', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence with function {{ users | length }}.'],
                ['2', '{{user | capitalize}} Functions are cool.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with liquid variables', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence with {{ variable }}.'],
                ['2', '{{variable}} sentence.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with inline html', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence<br>with <i>inline</i> html.'],
                ['2', 'Inline <b>html</b>.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with filters inside tables', () => {
        const parameters: RenderParameters = {
            skeleton: `\
#|
|| %%%1%%% | %%%2%%% ||
|| %%%3%%% | %%%4%%% ||
|#`,
            translations: new Map<string, string>([
                ['1', 'Heading one'],
                ['2', 'Heading two'],
                ['3', 'Cell with {{ variable | length }}'],
                ['4', 'Cell with {{ variable }}'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with abbreviations inside parenthesis', () => {
        const parameters: RenderParameters = {
            skeleton: `%%%1%%% %%%2%%%`,
            translations: new Map<string, string>([
                ['1', 'Sentence (см. [link](file.md)) continues.'],
                ['2', 'Another Sentence.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with inline code that has liquid syntax inside', () => {
        const parameters: RenderParameters = {
            skeleton: `%%%1%%% %%%2%%%`,
            translations: new Map<string, string>([
                ['1', 'Sentence with `inline code and {{ui-key.yacloud.common.label_tcp}}`.'],
                ['2', 'Another Sentence.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with links in the end of the sentences', () => {
        const parameters: RenderParameters = {
            skeleton: `%%%1%%% %%%2%%%`,
            translations: new Map<string, string>([
                [
                    '1',
                    'Инструкция содержит информацию о создании и настройке [группы рабочих столов](concepts/desktops-and-groups.md).',
                ],
                [
                    '2',
                    'Если вы получили от администратора ссылку на [витрину пользовательских рабочих столов](concepts/showcase.md), перейдите к подразделу [{#T}](#get-credentials).',
                ],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
