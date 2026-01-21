import {describe, expect, it} from 'vitest';

import {skeleton} from '.';

function render(content: string) {
    return skeleton(content, {compact: true});
}

describe('inline: skeleton rendering', () => {
    it('inline: renders hash instead of the sentences with plain text.', () => {
        const rendered = render('Предложение номер один. Предложение номер два.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with plain text, separated by newline.', () => {
        const rendered = render(`Предложение номер один.
Предложение номер два.`);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with strong syntax.', () => {
        const rendered = render('Предложение номер **один**. Предложение номер **два**.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with em syntax.', () => {
        const rendered = render('Предложение номер *один*. Предложение номер *два*.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with s syntax.', () => {
        const rendered = render('Предложение номер ~~один~~. Предложение номер ~~два~~.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with sup syntax.', () => {
        const rendered = render('Предложение номер^один^. Предложение номер^два^.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with samp syntax.', () => {
        const rendered = render('Предложение номер ##один##. Предложение номер ##два##.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with code syntax.', () => {
        const rendered = render('Предложение номер `один`. Предложение номер `два`.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with links syntax.', () => {
        const rendered = render(
            'Предложение номер [один](one.md "one"). Предложение номер [два](two.md "two").',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with ref links syntax.', () => {
        const rendered = render(
            'Предложение номер [{#T}](one.md "one"). Предложение номер [{#T}](two.md).',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with autolink syntax.', () => {
        const rendered = render(
            'Предложение номер один <https://www.google.com>. Предложение номер два <https://www.youtube.com>.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with variable href link syntax.', () => {
        const rendered = render(
            'Предложение номер [один]({{one}} "title"). Предложение номер [два]({{ two }}).',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with image syntax.', () => {
        const rendered = render(
            'Sentence ![image](_images/image.png "текст_подсказки" =100x100). Sentence ![image](_images/image.png "текст_подсказки" =x100). Sentence ![image](_images/image.png "текст_подсказки" =100x). Sentence ![image](_images/image.png =100x100). Sentence ![image](_images/image.png). []().',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with variable image syntax.', () => {
        const rendered = render('Sentence ![image]({{one}}). Sentence ![image]({{ two }}).');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with video syntax.', () => {
        const rendered = render(
            'Sentence goes here. Another sentence @[youtube](https://youtu.be/rJz4OaURJ6U)',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with anchor heading syntax.', () => {
        const rendered = render(
            '# Heading with multiple anchors {#anchor1} {#anchor2}\n\n## Heading without anchor',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with file syntax.', () => {
        const rendered = render(
            'Sentence with {% file src="path/to/file" name="readme.md" referrerpolicy="no-referrer" rel="noopener" target="_blank" type="text/plain" %}. Another sentence.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid conditions.', () => {
        const rendered = render(
            'Sentence with {% if var == "val" %} val{% else %} other val{% endif %}. {% var == "val" %} A{% else %} B{% endif %} Point.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid loops.', () => {
        const rendered = render(
            'Sentence {% for x in xs %}x{% endfor %}. {% for x in xs %}X{% endfor %} cool.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid functions.', () => {
        const rendered = render(
            'Sentence with function {{ user.name.slice(1, 2) }}. {{ user.name.slice(1, 2) }} starts with function.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid filters.', () => {
        const rendered = render(
            'Sentence with function {{ users | length }}. {{user | capitalize}} Functions are cool.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid variables.', () => {
        const rendered = render('Sentence with {{ variables }}. {{variable}} sentence.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with inline html.', () => {
        const rendered = render('Sentence<br>with <b>html</b>. Another <s>sentence</s>.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with liquid filters inside tables.', () => {
        const rendered = render(`\
#|
|| Heading one | Heading two ||
|| Cell with {{ variable | length }} | Cell with {{ variable }} ||
|#`);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with abbreviations inside parenthesis', () => {
        const rendered = render(`Sentence (см. [link](file.md)) continues. Another Sentence.`);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with inline code that has liquid syntax inside', () => {
        const rendered = render(
            'Sentence with `inline code and {{ui-key.yacloud.common.label_tcp}}`. Another sentence.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with links in the end', () => {
        const rendered = render(
            'Инструкция содержит информацию о создании и настройке [группы рабочих столов](concepts/desktops-and-groups.md). Если вы получили от администратора ссылку на [витрину пользовательских рабочих столов](concepts/showcase.md), перейдите к подразделу [{#T}](#get-credentials).',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with deflist', () => {
        const rendered = render('Term\n\n:   Definition.');
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with duplicate text into inline code', () => {
        const rendered = render(
            'Sentence with `token` and `Second token. Level 1, Second token. Level 2.`',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders hash instead of the sentences with sentences in inline code', () => {
        const rendered = render(
            'Sentence with `token` and finish sentence. `Second sentence. Third token.` Another sentence. And sentence `at the end` of line. ',
        );
        expect(rendered).toMatchSnapshot();
    });
});
