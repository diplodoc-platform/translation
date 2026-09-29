import {describe, expect, it} from 'vitest';

import {compose, extract} from 'src/api';
import {CodeProcessing} from 'src/consumer';
import {replace} from 'src/utils';

it('does not apply Markdown attribute escaping to general string replacement', () => {
    expect(replace("{wide-content title='%%%0%%%'}", ["Owner's table"])[0]).toBe(
        "{wide-content title='Owner's table'}",
    );
});

describe.each([true, false])('table title extraction (compact=%s)', (compact) => {
    const options = {
        compact,
        source: {language: 'ru', locale: 'RU'},
        target: {language: 'en', locale: 'US'},
    } as const;

    it.each([
        '{wide-content title="Название таблицы"}',
        "{wide-content title='Название таблицы'}",
        '{wide-content title="Название таблицы" width="100%"}',
        '{wide-content width="100%" title="Название таблицы"}',
        '{wide-content data-value="{{name}}" title="Название таблицы"}',
        '{wide-content title="Название таблицы" data-value="{{name}}"}',
    ])('exposes the title without its attribute syntax: %s', (attribute) => {
        const source = '| A | B |\n| --- | --- |\n| 1 | 2 |\n\n' + attribute;
        const result = extract(source, options);

        expect(result.warnings).toEqual([]);
        expect(result.units).toContain('<source xml:space="preserve">Название таблицы</source>');
        expect(result.units.join('')).not.toContain('wide-content');
        expect(result.skeleton).toContain(attribute.replace('Название таблицы', '%%%4%%%'));
        expect(compose(result.skeleton, result.units, {useSource: true})).toBe(source);
        const translated = result.units.map((unit) =>
            unit.replace('Название таблицы', 'Table title'),
        );
        expect(compose(result.skeleton, translated, {useSource: true})).toBe(
            source.replace('Название таблицы', 'Table title'),
        );
    });

    it.each([
        String.raw`{wide-content title="Название \"таблицы\""}`,
        "{wide-content title='Название \\'таблицы\\''}",
        '{wide-content title="Название {{ product }}"}',
        '{wide-content title="Название **таблицы**"}',
    ])('preserves quoted title contents and variables: %s', (attribute) => {
        const source = '| A |\n| --- |\n| 1 |\n\n' + attribute;
        const result = extract(source, options);
        expect(result.warnings).toEqual([]);
        expect(result.units.join('')).not.toContain('wide-content');
        expect(compose(result.skeleton, result.units, {useSource: true})).toBe(source);
        const translated = result.units.map((unit) => unit.replace('Название', 'Title'));
        expect(compose(result.skeleton, translated, {useSource: true})).toBe(
            source.replace('Название', 'Title'),
        );
    });

    it.each([
        '`{wide-content title="Название таблицы"}`',
        '```markdown\n{wide-content title="Название таблицы"}\n```',
        '# {wide-content title="Название таблицы"}',
        '{other title="Название таблицы"}',
        '{wide-content data-title="Название таблицы"}',
        '{wide-content title="Название таблицы}',
        '{wide-content title="Название таблицы"} extra',
        '{wide-content data="title=Название таблицы"}',
        '{wide-content title="Название таблицы" title="Duplicate"}',
    ])('does not extract attribute titles from literals or unsupported forms: %s', (source) => {
        const result = extract(source, {...options, code: CodeProcessing.ADAPTIVE});
        expect(result.units).not.toContain(
            '<source xml:space="preserve">Название таблицы</source>',
        );
        expect(compose(result.skeleton, result.units, {useSource: true})).toBe(source);
    });

    it('keeps empty titles and other attributes out of translation units', () => {
        const source = '| A |\n| --- |\n| 1 |\n\n{wide-content title="" width="100%"}';
        const result = extract(source, options);
        expect(result.units).toEqual([
            '<source xml:space="preserve">A</source>',
            '<source xml:space="preserve">1</source>',
        ]);
        expect(compose(result.skeleton, result.units, {useSource: true})).toBe(source);
    });

    it.each([
        {quote: "'", translation: 'Owner&apos;s table', expected: "Owner\\'s table"},
        {quote: '"', translation: 'A &quot;quoted&quot; table', expected: 'A \\"quoted\\" table'},
        {quote: '"', translation: 'Path \\', expected: 'Path \\\\'},
    ])(
        'escapes translated text for the original delimiter: $translation',
        ({quote, translation, expected}) => {
            const source = `{wide-content title=${quote}Имя${quote}}`;
            const result = extract(source, options);
            const translated = result.units.map((unit) => unit.replace('Имя', translation));
            expect(compose(result.skeleton, translated, {useSource: true})).toBe(
                `{wide-content title=${quote}${expected}${quote}}`,
            );
        },
    );

    it.each([
        "> {wide-content title='Имя'}",
        "- {wide-content title='Имя'}",
        "{wide-content title='Имя'}  ",
        "{wide-content title='Имя' data-value={{name}}}",
        "{wide-content title='Имя' id=table-{{name}}}",
        "{wide-content title='Имя' id={{first}}{{second}}}",
    ])('escapes titles in the same contexts accepted by extraction: %s', (source) => {
        const result = extract(source, options);
        const translated = result.units.map((unit) => unit.replace('Имя', 'Owner&apos;s table'));
        expect(compose(result.skeleton, translated, {useSource: true})).toBe(
            source.replace('Имя', "Owner\\'s table"),
        );
    });
});
