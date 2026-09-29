import {describe, expect, it} from 'vitest';
import transform from '@diplodoc/transform';
import {load} from 'cheerio';

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
        '{wide-content title="Название {{ product }}"}',
        '{wide-content title="Название {{ product | upper }}"}',
        '{wide-content title="Название {{ get_product() }}"}',
        '{wide-content title="Название **таблицы**"}',
    ])('preserves quoted title contents and variables: %s', (attribute) => {
        const source = '| A |\n| --- |\n| 1 |\n\n' + attribute;
        const result = extract(source, options);
        expect(result.warnings).toEqual([]);
        expect(result.units.join('')).not.toContain('wide-content');
        expect(result.tableTitles?.length).toBe(1);
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
        "{wide-content title='Название таблицы'}",
        String.raw`{wide-content title="Название \"таблицы\""}`,
        '{wide-content title="Название } таблицы"}',
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
        ['Owner&apos;s table', "Owner's table"],
        ['Path \\', 'Path \\'],
        ['C:\\tools\\new', 'C:\\tools\\new'],
        ['A “quoted” table', 'A “quoted” table'],
        ['A &amp; B', 'A & B'],
    ])('renders the translated title literally: %s', (translation, expected) => {
        const source = '| A |\n| --- |\n| B |\n\n{wide-content title="Имя" width="100%"}';
        const result = extract(source, options);
        const translated = result.units.map((unit) => unit.replace('Имя', translation));
        const output = compose(result.skeleton, translated, {useSource: true});
        const html = transform(output).result.html;
        const table = load(html)('table');
        expect(table.attr('title')).toBe(expected);
        expect(table.attr('width')).toBe('100%');
        expect(table.attr('wide-content')).toBe('');
        expect(table.find('td').text()).toBe('B');
    });

    it.each(['Owner&apos;s &quot;x&quot; table', 'Example } details', 'First\nsecond'])(
        'rejects unrepresentable title text instead of silently corrupting HTML: %s',
        (translation) => {
            const result = extract('{wide-content title="Имя"}', options);
            const translated = result.units.map((unit) => unit.replace('Имя', translation));
            expect(() => compose(result.skeleton, translated, {useSource: true})).toThrow(
                /wide-table title/,
            );
        },
    );

    it('identifies title units separately from ordinary prose for provider validation', () => {
        const result = extract('Абзац.\n\n{wide-content title="Имя"}', options);
        expect(result.tableTitles).toEqual([[1]]);
    });

    it('groups all sentences of a title for an atomic source fallback', () => {
        const result = extract('{wide-content title="Первая фраза. Вторая фраза."}', options);
        expect(result.tableTitles).toEqual([[0, 1]]);
    });

    it.each([
        '> {wide-content title="Имя"}',
        '- {wide-content title="Имя"}',
        '{wide-content title="Имя"}  ',
        '{wide-content title="Имя" data-value={{name}}}',
        '{wide-content title="Имя" id=table-{{name}}}',
        '{wide-content title="Имя" id={{first}}{{second}}}',
    ])('preserves apostrophes in contexts accepted by extraction: %s', (source) => {
        const result = extract(source, options);
        const translated = result.units.map((unit) => unit.replace('Имя', 'Owner&apos;s table'));
        expect(compose(result.skeleton, translated, {useSource: true})).toBe(
            source.replace('Имя', "Owner's table"),
        );
    });
});
