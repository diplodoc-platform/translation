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

describe('image: standard =WxH size syntax', () => {
    it('renders standalone image without size', () => {
        expect(render('![alt](image.png)')).toMatchSnapshot();
    });

    it('renders standalone image with =WxH (both dimensions)', () => {
        expect(render('![alt](image.png =100x200)')).toMatchSnapshot();
    });

    it('renders standalone image with =Wx (width only)', () => {
        expect(render('![alt](image.png =100x)')).toMatchSnapshot();
    });

    it('renders standalone image with =xH (height only)', () => {
        expect(render('![alt](image.png =x200)')).toMatchSnapshot();
    });

    it('renders standalone image with title and =WxH', () => {
        expect(render('![alt](image.png "tooltip" =100x200)')).toMatchSnapshot();
    });

    it('renders standalone image with title and =xH', () => {
        expect(render('![alt](image.png "tooltip" =x200)')).toMatchSnapshot();
    });

    it('renders inline image with =WxH inside sentence', () => {
        expect(
            render('First sentence. ![alt](image.png =100x200) Second sentence.'),
        ).toMatchSnapshot();
    });

    it('renders inline image with Liquid variable src and =WxH', () => {
        expect(
            render('First sentence. ![alt]({{ img-var }} =100x200) Second sentence.'),
        ).toMatchSnapshot();
    });
});

describe('image: markdown-it-attrs {width=Npx} syntax', () => {
    it('renders standalone image with {width=Npx}', () => {
        expect(render('![](image.png){width=700px}')).toMatchSnapshot();
    });

    it('renders standalone image with {width=Npx}{.class}', () => {
        expect(render('![](image.png){width=700px}{.border-yes}')).toMatchSnapshot();
    });

    it('renders standalone image with Liquid variable src and {width=Npx}', () => {
        expect(render('![]({{ img-warning }}){width=700px}')).toMatchSnapshot();
    });

    it('renders standalone image with Liquid variable src, {width=Npx} and {.class}', () => {
        expect(render('![]({{ img-warning }}){width=700px}{.border-yes}')).toMatchSnapshot();
    });

    it('renders standalone image with {height=Npx}', () => {
        expect(render('![](image.png){height=400px}')).toMatchSnapshot();
    });

    it('renders standalone image with {width=Npx} and {height=Npx}', () => {
        expect(render('![](image.png){width=700px}{height=400px}')).toMatchSnapshot();
    });

    it('renders inline image with {width=Npx} inside sentence', () => {
        expect(
            render(
                'First sentence. ![]({{ img-example }}){width=700px}{.border-yes} Second sentence.',
            ),
        ).toMatchSnapshot();
    });

    it('renders multiple images with {width=Npx} in same paragraph', () => {
        expect(
            render(
                'First sentence. ![](img1.png){width=300px} Second sentence. ![](img2.png){width=500px} Third sentence.',
            ),
        ).toMatchSnapshot();
    });

    it('renders liquid condition with single image with {width=Npx}', () => {
        expect(
            render('{% if tld == "kz" %}![]({{ img }}){width=700px}{.border-yes}{% endif %}'),
        ).toMatchSnapshot();
    });

    it('renders two images in separate liquid conditions on same line', () => {
        expect(
            render(
                '{% if tld == "ru" or tld == "uz" %}![]({{ img }}){width=700px}{.border-yes}{% endif %}' +
                    '{% if tld == "kz" %}![]({{ img }}){width=700px}{.border-yes}{% endif %}',
            ),
        ).toMatchSnapshot();
    });

    it('renders text with two images in separate liquid conditions (the kz pattern)', () => {
        expect(
            render(
                'Text before.\n\n' +
                    '{% if tld == "ru" or tld == "uz" or tld == "com" or tld == "tr" %}' +
                    '![]({{ img-snippet }}){width=700px}{.border-yes}' +
                    '{% endif %}' +
                    '{% if tld == "kz" %}' +
                    '![]({{ img-snippet }}){width=700px}{.border-yes}' +
                    '{% endif %}\n\n' +
                    'Text after.',
            ),
        ).toMatchSnapshot();
    });

    it('renders image with {width=Npx} without alt text', () => {
        expect(render('![]({{ img-entity-search }}){width=700px}{.border-yes}')).toMatchSnapshot();
    });

    it('renders image with alt text and {width=Npx}', () => {
        expect(render('![image description](image.png){width=700px}')).toMatchSnapshot();
    });
});

describe('image inside link', () => {
    // Standalone clickable images: alt text and title are correctly extracted
    it('renders standalone clickable image with =WxH syntax', () => {
        expect(
            render(
                '[![An old rock in the desert](../_images/mountain.jpg "Mountain" =100x200)](https://yandex.com/images/search?text=mountain)',
            ),
        ).toMatchSnapshot();
    });

    it('renders standalone clickable image with {width=Npx} syntax', () => {
        expect(
            render(
                '[![An old rock in the desert](../_images/mountain.jpg "Mountain"){width=100px}](https://yandex.com/images/search?text=mountain)',
            ),
        ).toMatchSnapshot();
    });

    it('renders standalone clickable image without alt text', () => {
        expect(render('[![](../_images/mountain.jpg)](https://yandex.com/)')).toMatchSnapshot();
    });

    // TODO: known issue — when an image with alt text is embedded inside a sentence,
    // the consumer incorrectly truncates content after the alt text hash.
    // This is a pre-existing bug unrelated to the image skip fix.
    it('renders sentence with clickable image and surrounding text (known truncation issue)', () => {
        expect(
            render(
                'First sentence. [![An old rock in the desert](../_images/mountain.jpg "Mountain" =100x200)](https://yandex.com/) Second sentence.',
            ),
        ).toMatchSnapshot();
    });

    it('renders sentence with clickable image with {width=Npx} and surrounding text (known truncation issue)', () => {
        expect(
            render(
                'First sentence. [![An old rock in the desert](../_images/mountain.jpg "Mountain"){width=100px}](https://yandex.com/) Second sentence.',
            ),
        ).toMatchSnapshot();
    });
});

describe('image: translatable attributes (title and alt)', () => {
    it('renders standalone image with title only (no size)', () => {
        expect(render('![alt text](image.png "A tooltip text")')).toMatchSnapshot();
    });

    it('renders standalone image with title and {width=Npx} syntax', () => {
        expect(render('![alt](image.png "tooltip"){width=700px}')).toMatchSnapshot();
    });

    it('renders standalone image with title as full sentence', () => {
        expect(render('![alt](image.png "First sentence. Second sentence.")')).toMatchSnapshot();
    });

    it('renders standalone image with title as Liquid variable', () => {
        expect(render('![alt](image.png "{{ tooltip_var }}")')).toMatchSnapshot();
    });

    it('renders standalone image with empty alt and title present', () => {
        expect(render('![](image.png "tooltip")')).toMatchSnapshot();
    });

    it('renders standalone image with alt as full sentence', () => {
        expect(render('![A mountain in the desert.](image.png)')).toMatchSnapshot();
    });

    it('renders standalone image with alt as full sentence and title', () => {
        expect(
            render('![A mountain in the desert.](image.png "A tooltip sentence.")'),
        ).toMatchSnapshot();
    });

    it('renders standalone image with title via markdown-it-attrs {title="..."} syntax', () => {
        expect(render('![alt](image.png){title="A tooltip text"}')).toMatchSnapshot();
    });

    it('renders standalone SVG with title and inline via markdown-it-attrs', () => {
        expect(render('![alt](test.svg){title="New Title" inline=true}')).toMatchSnapshot();
    });
});
