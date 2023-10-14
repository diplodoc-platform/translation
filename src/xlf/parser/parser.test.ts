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
});