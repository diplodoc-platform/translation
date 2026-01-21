import {describe, expect, it} from 'vitest';

import {hash} from 'src/hash';
import {skeleton} from 'src/skeleton';
import {template} from 'src/xliff';

function render(markdown: string) {
    const hashed = hash();

    skeleton(markdown, {compact: true}, hashed);

    return template(hashed.segments, {
        source: {
            language: 'ru',
            locale: 'RU' as const,
        },
        target: {
            language: 'en',
            locale: 'US' as const,
        },
    });
}

describe('renders xliff from markdown', () => {
    it('renders plain text', () => {
        const rendered = render('Предложение номер один. Предложение номер два.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders plain text sentences separated by newline', () => {
        const rendered = render('Предложение номер один.\nПредложение номер два.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders strong wrapped in <x> tags', () => {
        const rendered = render('Предложение номер **один**. Предложение номер **два**.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders em wrapped in <x> tags', () => {
        const rendered = render('Предложение номер *один*. Предложение номер *два*.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders s wrapped in <x> tags', () => {
        const rendered = render('Предложение номер ~~один~~. Предложение номер ~~два~~.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders sup wrapped in <x> tags', () => {
        const rendered = render('Предложение номер^один^. Предложение номер^два^.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders samp wrapped in <x> tags', () => {
        const rendered = render('Предложение номер ##один##. Предложение номер ##два##.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders code wrapped in <x> tag', () => {
        const rendered = render('Предложение номер `один`. Предложение номер `два`.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders links wrapped in <x> tags', () => {
        const rendered = render(
            'Предложение номер [один](one.md "one"). Предложение номер [два](two.md).',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders ref links wrapped in <x> tags', () => {
        const rendered = render(
            'Предложение номер [{#T}](one.md "one"). Предложение номер [{#T}](two.md).',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders autolink wrapped in <x> tags', () => {
        const rendered = render(
            'Предложение номер один <https://www.google.com>. Предложение номер два <https://www.youtube.com>.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders variable href link wrapped in <x> tags', () => {
        const rendered = render(
            'Предложение номер [один]({{one}} "one"). Предложение номер [два]({{two}}).',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders link with multiple sentences inside text part and title part wrapped in <x> tags', () => {
        const rendered = render(
            '[Link text sentence one! Link text sentence Two](file.md "Link title sentence one. Link title sentence two!")',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders image all attributes wrapped in <x> tags', () => {
        const rendered = render(
            'Sentence ![image](image.png "hint" =100x100). Sentence ![image](image.png "hint" =x100). Sentence ![image](image.png "hint" =100x). Sentence ![image](image.png =100x100). Sentence ![image](image.png "hint"). Sentence ![image](image.png). Sentence ![]().',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders video wrapped in <x> tag', () => {
        const rendered = render(
            'Sentence goes here. Another sentence @[youtube](https://youtu.be/rJz4OaURJ6U)',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders heading with anchors wrapped in <x> tags', () => {
        const rendered = render('# Heading with anchors {#anchor1} {#anchor2}');
        expect(rendered).toMatchSnapshot();
    });

    it('renders file wrapped in <x> tags', () => {
        const rendered = render(
            'Sentence with {% file src="path/to/file" name="readme.md" referrerpolicy="no-referrer" rel="noopener" target="_blank" type="text/plain" %}.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid conditions wrapped in <x> tags', () => {
        const rendered = render(
            'Sentence with {% if var == "val" %} val{% else %} other val{% endif %}. {% if var == "val" %} A{% else %} B{% endif %} Point.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid loops wrapped in <x> tags', () => {
        const rendered = render(
            'Sentence {% for x in xs %}x{% endfor %}. {% for x in xs %}X{% endfor %} cool.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid functions wrapped in <x> tags', () => {
        const rendered = render(
            'Sentence with function {{ user.name.slice(1, 2) }}. {{ user.name.slice(1, 2) }} starts with function.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid filters wrapped in <x> tags', () => {
        const rendered = render(
            'Sentence with filter {{ users | length }}. {{user | capitalize}} starts with filter.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid variables wrapped in <x> tags', () => {
        const rendered = render('Sentence with {{ variable }}. {{variable}} sentence.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders html wrapped in <x> tags', () => {
        const rendered = render('Sentence<br>with <b>html</b>.');
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid filters wrapped in <x> tags inside tables', () => {
        const rendered = render(`\
#|
|| Heading one | Heading two ||
|| Cell with {{ variable | length }} | Cell with {{ variable }} ||
|#`);
        expect(rendered).toMatchSnapshot();
    });

    it('renders sentences with abbreviations inside parenthesis', () => {
        const rendered = render(`Sentence (см. [link](file.md)) continues. Another sentence.`);
        expect(rendered).toMatchSnapshot();
    });

    it('renders sentences with inline code that has liquid syntax inside', () => {
        const rendered = render(
            'Sentence `{{ ui-key.yacloud.common.label_tcp }} other`. Another sentence `{{user.name | capitalize}} other`.',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('renders sentences with links in the end', () => {
        const rendered = render(
            'Инструкция содержит информацию о создании и настройке [группы рабочих столов](concepts/desktops-and-groups.md). Если вы получили от администратора ссылку на [витрину пользовательских рабочих столов](concepts/showcase.md), перейдите к подразделу [{#T}](#get-credentials).',
        );
        expect(rendered).toMatchSnapshot();
    });
});
