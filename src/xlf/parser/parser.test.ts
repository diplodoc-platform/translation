import {parseTranslations} from './index';
import {generateTemplate, generateTransUnit, TransUnitParameters} from 'src/xlf/generator';

const templateParameters = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

const {
    template: [before, after],
} = generateTemplate(templateParameters);

const generateXLF = (units: TransUnitParameters[]) => before + units.map(generateTransUnit) + after;

describe('smoke', () => {
    it('works', () => {
        const units = [
            {target: 'Предложение о чем-то', id: 1},
            {target: 'Фрагмент Текста', id: 2},
        ];
        const xlf = generateXLF(units);
        parseTranslations({xlf});
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const units = [
            {target: 'Предложение о чем-то', id: 1},
            {target: 'Фрагмент Текста', id: 1},
        ];
        const xlf = generateXLF(units);
        parseTranslations({xlf});
    });

    it('throws on invalid parameters', () => {
        const invalidXLF = before + '</kek>' + after;

        // empty xlf is invalid
        expect(() => parseTranslations({xlf: ''})).toThrow();
        // invalid xml is invalid xlf
        expect(() => parseTranslations({xlf: invalidXLF})).toThrow();
    });
});

describe('parses translation units', () => {
    it('parses targets', () => {
        const units = [
            {target: 'Предложение о чем-то', id: 1},
            {target: 'Фрагмент Текста', id: 2},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(2);
        expect(translations).toMatchSnapshot();
    });

    it('parses single trans-unit', () => {
        const units = [{target: 'Предложение о чем-то', id: 1}];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses sources when targets are absent with useSource flag enabled', () => {
        const units = [
            {source: 'Предложение о чем-то', id: 1},
            {source: 'Фрагмент Текста', id: 2},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf, useSource: true});

        expect(translations.length).toStrictEqual(2);
        expect(translations).toMatchSnapshot();
    });
});

describe('parses translation units with <g> and <x> tags', () => {
    it('parses strong wrapped in <g> tags', () => {
        const units = [
            {id: 1, target: 'Предложение номер <g ctype="x-strong" equiv-text="**">один</g>.'},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses em wrapped in <g> tags', () => {
        const units = [
            {id: 1, target: 'Предложение номер <g ctype="x-em" equiv-text="*">один</g>.'},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses em wrapped in <g> tags', () => {
        const units = [
            {id: 1, target: 'Предложение номер <g ctype="x-s" equiv-text="~~">один</g>.'},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses sup wrapped in <g> tags', () => {
        const units = [
            {id: 1, target: 'Предложение номер <g ctype="x-sup" equiv-text="^">один</g>.'},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses samp wrapped in <g> tags', () => {
        const units = [
            {id: 1, target: 'Предложение номер <g ctype="x-samp" equiv-text="##">один</g>.'},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses code wrapped in <x> tag', () => {
        const units = [
            {id: 1, target: 'Предложение номер <x ctype="x-code" equiv-text="`один`" />.'},
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses links wrapped in <g> and <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <g ctype="x-link_text_part" equiv-text="[]">один</g><g ctype="x-link_attributes_part" equiv-text="()"><x ctype="x-link_attributes_href" equiv-text="one.md" /><g ctype="x-link_attributes_title" equiv-text="&quot;&quot;">one</g></g>.',
            },
            {
                id: 2,
                target: 'Предложение номер <g ctype="x-link_text_part" equiv-text="[]">два</g><g ctype="x-link_attributes_part" equiv-text="()"><x ctype="x-link_attributes_href" equiv-text="two.md" /></g>.',
            },
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses ref links wrapped in <g> and <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-link_reflink" equiv-text="[{#T}]" /><g ctype="x-link_attributes_part" equiv-text="()"><x ctype="x-link_attributes_href" equiv-text="one.md" /><g ctype="x-link_attributes_title" equiv-text="&quot;&quot;">one</g></g>.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-link_reflink" equiv-text="[{#T}]" /><g ctype="x-link_attributes_part" equiv-text="()"><x ctype="x-link_attributes_href" equiv-text="two.md" /></g>.',
            },
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses autolink wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер один <x ctype="x-link_autolink" equiv-text="&lt;https://www.google.com&gt;" />.',
            },
        ];
        const xlf = generateXLF(units);
        const translations = parseTranslations({xlf});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });
});
