import {beforeAll, describe, expect, it} from 'vitest';

import {compose, extract} from 'src/api';
import {hash} from 'src/hash';

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

describe('visibility directive', () => {
    const markdown = `Common text.

:::visibility agent
Agent instructions.
:::

:::visibility human
Human instructions.
:::
`;

    it('preserves directive markup and extracts both audience bodies', () => {
        const {skeleton: result, units} = extract(markdown, {
            compact: true,
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
        });

        expect(result).toContain(':::visibility agent');
        expect(result).toContain(':::visibility human');
        expect(units.join('\n')).toContain('Agent instructions.');
        expect(units.join('\n')).toContain('Human instructions.');
        expect(units.join('\n')).not.toContain(':::visibility');
    });

    it('roundtrips without changing directive markup', () => {
        const {skeleton: result, units} = extract(markdown, {
            compact: true,
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
        });

        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('keeps text translatable when the audience value is invalid', () => {
        const invalidMarkdown = `:::visibility robots
Text that still needs translation.
:::
`;
        const {skeleton: result, units} = extract(invalidMarkdown, {
            compact: true,
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
        });

        expect(result).toContain(':::visibility robots');
        expect(units.join('\n')).toContain('Text that still needs translation.');
        expect(compose(result, units, {useSource: true})).toBe(invalidMarkdown);
    });
});

describe('compact: markup at the edge of a sentence', () => {
    const extractCompact = (markdown: string) =>
        extract(markdown, {
            compact: true,
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
        });

    it('keeps inline code that starts a sentence inside the unit', () => {
        const markdown = '- `list_node` type has been deprecated.\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result).toBe('- %%%0%%%\n');
        expect(units[0]).toContain(
            '<x ctype="code_open" equiv-text="`" id="x-1"/>list_node<x ctype="code_close" equiv-text="`" id="x-2"/> type',
        );
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('keeps inline code that ends a sentence inside the unit', () => {
        const markdown = 'Moved to `spyt.connect`\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result).toBe('%%%0%%%\n');
        expect(units[0]).toMatch(/spyt\.connect<x ctype="code_close"[^>]*\/><\/source>/);
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('keeps emphasis that starts a sentence inside the unit', () => {
        const markdown = '**Release date:** 2026-08-25\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result).toBe('%%%0%%%\n');
        expect(units[0]).toContain('<g ctype="bold"');
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('still moves markup wrapping the whole sentence into the skeleton', () => {
        const markdown = '**Whole bold sentence.**\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result).toBe('**%%%0%%%**\n');
        expect(units[0]).not.toContain('ctype="bold"');
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('starts a new sentence at inline code after a full stop', () => {
        const markdown =
            '- Read-only mode persists. `yt-admin exit` command should be used to leave it.\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result).toBe('- %%%0%%% %%%1%%%\n');
        expect(units[0]).toContain('>Read-only mode persists.</source>');
        expect(units[1]).toContain('>yt-admin exit<');
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('keeps inline code inside a sentence where no sentence ends', () => {
        const markdown = 'Use the `yt-admin exit` command, then `yt-admin enter` again.\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result).toBe('%%%0%%%\n');
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('does not start a new sentence at inline code after an abbreviation', () => {
        const markdown = 'Migrate to a new naming scheme (e.g. `job` -> `yt-job`).\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result).toBe('%%%0%%%\n');
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it('keeps the output without compact when a part starts with an unpaired closing token', () => {
        const {skeleton: result, xliff} = extract('**A. [B](url)** C.\n', {
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
        });

        expect(result).toBe('**%%%0%%% [%%%1%%%\n');
        expect(xliff).toContain('ctype="link_text_part_close"');
    });

    it('keeps markup at the edge in the skeleton without compact when markup is unbalanced', () => {
        const markdown = '_[Header](#header) — shows the name.  \n[Tabs](#tabs) — links._\n';
        const {skeleton: result, xliff} = extract(markdown, {
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
        });

        expect(result).toContain('[%%%');
        expect(xliff).toContain('ctype="link_text_part_close"');
    });

    it('does not start a new sentence at inline code without compact', () => {
        const markdown = 'Read-only mode persists. `yt-admin exit` command should be used.\n';

        expect(skeleton(markdown, {compact: false})).toBe('%%%0%%%\n');
    });

    it('still moves markup crossing the sentence edge into the skeleton', () => {
        const markdown = '**First bold. Second bold** plain.\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(result.startsWith('**%%%0%%%')).toBe(true);
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });
});

describe('compact: markup and sentences around inline code', () => {
    const extractCompact = (markdown: string) =>
        extract(markdown, {
            compact: true,
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
        });

    // Placeholders read as braces, so a snapshot shows where each marker went.
    const readable = (unit: string) =>
        unit
            .replace(/<source[^>]*>|<\/source>/g, '')
            .replace(/<x ctype="(\w+)"[^>]*\/>/g, '{$1}')
            .replace(/<g ctype="(\w+)"[^>]*>/g, '{$1:')
            .replace(/<\/g>/g, '}');

    const cases = [
        // markup at one edge of a sentence stays in the unit
        'Ends with `code`',
        '`a` both `b`',
        '**`nested`** starts here.',
        '**Bold with `code` inside** wraps all.',
        '*em* starts, **bold** ends **here**',
        '[Link](https://x.y) at start.',
        'At end [link](https://x.y)',
        '[**Bold link**](https://x.y) start.',
        '![image](img.png) starts a sentence.',
        '~~strike~~ at start.',
        '`code` then **bold** then `code`',
        '`{{ var }}` in code at start.',
        // markup around the whole sentence or across its edge stays in the skeleton
        '`only code`',
        '**Bold with `code` inside.**',
        '**First bold. Second bold** plain.',
        'Plain. **Bold one. Bold two.** Plain again.',
        '<span>html</span> at start.',
        // a sentence starts at inline code
        'Text with `code`. `Next` sentence starts with code.',
        'Done! `next` starts. Why? `this` too.',
        'Предложение. `код` в начале второго.',
        'Line one.\n`code` on next line.',
        'Sentence. `Only code.`',
        'Ends with period `inside code.` Then text.',
        // and does not where no sentence ends
        'See e.g. `foo` and i.e. `bar`, vs. `baz`.',
        'См. `foo` и т.е. `bar`.',
        'Code `a. b` has period inside. Next.',
        'Colon: `code` here.',
        'Starts with `code` only at start.',
    ];

    it.each(cases)('%j', (text) => {
        const markdown = text + '\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect({skeleton: result, units: units.map(readable)}).toMatchSnapshot();
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it.each([
        ['a link', 'See [docs](x.md "Title")', '](x.md "'],
        ['an image', 'See ![img](x.png "Title")', '](x.png "'],
    ])('keeps %s with a title ending the sentence in the skeleton', (_, text, kept) => {
        const units = (markdown: string) =>
            extract(markdown, {
                compact: true,
                unitLocalIds: true,
                source: {language: 'en', locale: 'US'},
                target: {language: 'ru', locale: 'RU'},
            });
        const alone = units(text + '\n');
        const below = units('- One more item above.\n- ' + text + '\n');

        // The title is a unit of its own; inside the sentence unit its
        // placeholder would number the unit by the units above it.
        expect(alone.skeleton).toContain(kept);
        expect(alone.units.at(-1)).not.toContain('%%%');
        expect(below.units.at(-1)).toBe(alone.units.at(-1));
        expect(compose(alone.skeleton, alone.units, {useSource: true})).toBe(text + '\n');
    });

    it('does not make a unit of the full stop after a {#T} link', () => {
        const markdown = '[{#T}](./x). `code` next.\n';
        const {skeleton: result, units} = extractCompact(markdown);

        expect(units).toHaveLength(1);
        expect(compose(result, units, {useSource: true})).toBe(markdown);
    });

    it.each([
        'See Fig. `bar` and p. `baz` here.',
        'То есть т. е. `x` и т.е. `y`, в табл. `w`.',
        'Rows, etc. `trimmed_row_count` is absolute.',
    ])('does not start a sentence at inline code after an abbreviation: %j', (text) => {
        expect(extractCompact(text + '\n').units).toHaveLength(1);
    });

    it('composes a translation that moves inline code off the start of the sentence', () => {
        const {skeleton: result, units} = extractCompact(
            '- `list_node` type has been deprecated.\n',
        );
        const [open, close] = units[0].match(/<x ctype="code_(?:open|close)"[^>]*\/>/g) || [];
        const translation = `<target xml:space="preserve">Тип ${open}list_node${close} устарел.</target>`;

        expect(compose(result, [translation], {useSource: false})).toBe(
            '- Тип `list_node` устарел.\n',
        );
    });

    it('composes a translation that moves a link off the start of the sentence', () => {
        const {skeleton: result, units} = extractCompact(
            '[Documentation](https://x.y/en/) is here.\n',
        );
        const link = /<g[^>]*>.*<\/g>/.exec(units[0])?.[0].replace('Documentation', 'документация');
        const translation = `<target xml:space="preserve">Здесь ${link}.</target>`;

        expect(compose(result, [translation], {useSource: false})).toBe(
            'Здесь [документация](https://x.y/en/).\n',
        );
    });
});

describe('code_inline: translate=no fence inside list items', () => {
    const render = (markdown: string) => skeleton(markdown, {compact: false});

    it('preserves multi-line triple-backtick code with translate=no in list item', () => {
        const rendered = render(
            '- bullet\n\n      ```text translate=no\n      SECRET\n      ```\n',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('preserves translate=no code in deeply indented list item', () => {
        const rendered = render(
            '- bullet\n\n              ```text translate=no\n              DEEP\n              ```\n',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('preserves translate=no code in nested list', () => {
        const rendered = render(
            '- outer\n\n  - nested\n\n        ```text translate=no\n        NESTED\n        ```\n',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('translates multi-line triple-backtick code WITHOUT translate=no in list item', () => {
        const rendered = render('- bullet\n\n      ```text\n      content\n      ```\n');
        expect(rendered).toMatchSnapshot();
    });

    it('does not treat triple-backtick code as fence when surrounded by text', () => {
        const rendered = render(
            '- bullet\n\n      hello ```text translate=no\n      SECRET\n      ``` world\n',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('does not treat single-line triple-backtick code as fence', () => {
        const rendered = render('Sentence with ``` triple ``` here.');
        expect(rendered).toMatchSnapshot();
    });

    it('does not treat single-backtick inline code with translate=no literal as fence', () => {
        const rendered = render('- bullet\n\n  Use `key=translate=no` here.\n');
        expect(rendered).toMatchSnapshot();
    });

    it('translates fence-like code with translate=yes', () => {
        const rendered = render(
            '- bullet\n\n      ```text translate=yes\n      VISIBLE\n      ```\n',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('preserves tilde-fence with translate=no in list item', () => {
        const rendered = render(
            '- bullet\n\n      ~~~text translate=no\n      SECRET\n      ~~~\n',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('preserves tilde-fence with translate=no in nested list', () => {
        const rendered = render(
            '- outer\n\n  - nested\n\n        ~~~text translate=no\n        NESTED\n        ~~~\n',
        );
        expect(rendered).toMatchSnapshot();
    });

    it('translates tilde-fence without translate=no in list item', () => {
        const rendered = render('- bullet\n\n      ~~~text\n      content\n      ~~~\n');
        expect(rendered).toMatchSnapshot();
    });

    it('does not treat single-line tildes as fence', () => {
        const rendered = render('A line with ~~~ inside text.');
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

describe('page-constructor: yaml-aware extraction', () => {
    // The one-time schema compilation is a setup cost, not a test cost:
    // warmed up here so every test below runs within the default timeout
    // even under coverage instrumentation.
    beforeAll(() => {
        render('::: page-constructor\nblocks: []\n:::\n');
    }, 30000);

    const block = `Текст до блока.

::: page-constructor
blocks:
  - type: 'header-block'
    title: 'Наш продукт'
    description: 'Описание продукта'
    buttons:
      - text: 'Начать'
        url: '/start'
:::

Текст после блока.
`;

    it('replaces translatable values with hashes and keeps yaml structure', () => {
        const rendered = render(block);

        expect(rendered).toContain("type: 'header-block'");
        expect(rendered).toContain("url: '/start'");
        expect(rendered).toContain("title: '%%%");
        expect(rendered).toContain("description: '%%%");
        expect(rendered).not.toContain('Наш продукт');
        expect(rendered).not.toContain('Начать');
        expect(rendered).toMatchSnapshot();
    });

    it('does not expose yaml structure in units', () => {
        const hashed = hash();
        skeleton(block, {compact: true}, hashed);

        const leaking = hashed.segments.filter(
            (unit) => unit.includes(':::') || unit.includes('type:') || unit.includes('url:'),
        );

        expect(leaking).toEqual([]);
        expect(hashed.segments).toMatchSnapshot();
    });

    it('keeps a block with broken yaml as is', () => {
        const broken = `::: page-constructor
blocks:
  - title: 'Заголовок
   bad: [indentation
:::
`;
        expect(render(broken)).toBe(broken);
    });

    it('extracts folded scalars and keeps literal scalars untranslated', () => {
        const multiline = `::: page-constructor
blocks:
  - type: 'header-block'
    title: 'Заголовок'
    description: >-
      Первая строка
      вторая строка
    text: |
      Первый абзац

      Второй абзац
:::
`;
        const rendered = render(multiline);

        expect(rendered).toContain("title: '%%%");
        // The folded scalar value is a single line, so it is matched
        // across the source lines and translated.
        expect(rendered).not.toContain('Первая строка');
        // The literal scalar value contains newlines and cannot be
        // matched verbatim, so it stays as is.
        expect(rendered).toContain('Первый абзац');
        expect(rendered).toContain('Второй абзац');
    });

    it('anchors values that are substrings of other values', () => {
        const collision = `::: page-constructor
blocks:
  - type: 'header-block'
    description: 'Наш продукт Про'
    title: 'Наш продукт'
:::
`;
        const rendered = render(collision);

        expect(rendered).toMatch(/description: '%%%\d+%%%'\n/);
        expect(rendered).toMatch(/title: '%%%\d+%%%'\n/);
        expect(rendered).not.toContain('Наш продукт');
    });

    it('does not match values inside non-translatable scalars', () => {
        const tricky = `::: page-constructor
blocks:
  - type: 'header-block'
    background:
      image:
        src: '/images/Начать'
    title: 'Начать'
:::
`;
        const rendered = render(tricky);

        expect(rendered).toContain("src: '/images/Начать'");
        expect(rendered).toMatch(/title: '%%%\d+%%%'\n/);
    });

    it('anchors repeated values to consecutive occurrences', () => {
        const repeated = `::: page-constructor
blocks:
  - type: 'card-layout-block'
    title: 'Карточки'
    children:
      - type: 'basic-card'
        text: 'Подробнее'
      - type: 'basic-card'
        text: 'Подробнее'
:::
`;
        const rendered = render(repeated);

        expect(rendered).not.toContain('Подробнее');
        expect(rendered.match(/text: '%%%\d+%%%'/g)).toHaveLength(2);
    });

    it('does not inject translations into scalars ending with the value', () => {
        const tricky = `::: page-constructor
blocks:
  - type: 'header-block'
    background:
      image:
        src: '/img/promo-Начать'
    title: 'Начать'
:::
`;
        const rendered = render(tricky);

        expect(rendered).toContain("src: '/img/promo-Начать'");
        expect(rendered).toMatch(/title: '%%%\d+%%%'\n/);
    });

    it('does not translate equal text in non-translatable fields', () => {
        const twins = `::: page-constructor
blocks:
  - type: 'filter-block'
    tags:
      - 'Начать'
    title: 'Начать'
:::
`;
        const rendered = render(twins);

        // The filter-block schema marks only the title as translatable.
        expect(rendered).toContain("- 'Начать'");
        expect(rendered).toMatch(/title: '%%%\d+%%%'\n/);
    });

    const conditional = `::: page-constructor
blocks:
  - type: 'card-layout-block'
    children:
      - type: 'basic-card'
        title: 'Яндекс Формы'
        text: 'Создавайте задачи из ответов.'

        {% if distr != "on-prem" %}
      - type: 'basic-card'
        title: 'Почта'
        text: 'Создавайте задачи из писем.'
        {% else %}
      - type: 'basic-card'
        title: 'Репозитории'
        text: 'Привязывайте мерж-реквесты.'
        {% endif %}
:::
`;

    it('extracts values around liquid conditions on their own lines', () => {
        const rendered = render(conditional);

        for (const text of ['Яндекс Формы', 'Почта', 'Репозитории', 'Привязывайте']) {
            expect(rendered).not.toContain(text);
        }
        expect(rendered).toContain('\n        {% if distr != "on-prem" %}\n');
        expect(rendered).toContain('\n        {% else %}\n');
        expect(rendered).toContain('\n        {% endif %}\n');
        expect(rendered.match(/(title|text): '%%%\d+%%%'/g)).toHaveLength(6);
    });

    it('keeps liquid conditions inside a block scalar in the skeleton', () => {
        const scalar = `::: page-constructor
blocks:
  - type: 'card-layout-block'
    children:
      - type: 'basic-card'
        title: 'Уведомления'
        text: >-
          {% if distr != 'on-prem' %}
          Получайте уведомления в мессенджере.
          {% else %}
          Получайте уведомления в браузере.
          {% endif %}

        {% if distr == 'saas' %}
      - type: 'basic-card'
        title: 'Плагины'
        {% endif %}
:::
`;
        const hashed = hash();
        const rendered = skeleton(scalar, {compact: true}, hashed);

        expect(rendered).not.toContain('Плагины');
        expect(rendered).toMatch(
            new RegExp(
                "text: >-\\n          \\{% if distr != 'on-prem' %\\}\\n          %%%\\d+%%%\\n" +
                    '          \\{% else %\\}\\n          %%%\\d+%%%\\n          \\{% endif %\\}\\n',
            ),
        );
        expect(rendered).toContain("\n        {% if distr == 'saas' %}\n");
        expect(hashed.segments.filter((unit) => unit.includes('{%'))).toEqual([]);
    });

    it('roundtrips a block with liquid conditions', () => {
        const {units, skeleton: skl} = extract(conditional, {
            compact: true,
            source: {language: 'ru', locale: 'RU'},
            target: {language: 'en', locale: 'US'},
        });

        expect(units).toHaveLength(6);
        expect(compose(skl, units, {useSource: true})).toBe(conditional);
    });

    it('does not touch page-constructor examples inside code fences', () => {
        const fenced =
            "```yaml\n::: page-constructor\nblocks:\n  - type: 'header-block'\n    title: 'Заголовок'\n:::\n```\n";
        expect(render(fenced)).toBe(fenced);
    });

    it('roundtrips through extract and compose', () => {
        const {units, skeleton: skl} = extract(block, {
            compact: true,
            source: {language: 'ru', locale: 'RU'},
            target: {language: 'en', locale: 'US'},
        });

        expect(compose(skl, units, {useSource: true})).toBe(block);
    });
});
