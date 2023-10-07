import {parseTranslations} from './index';
import {generateTemplate, generateTransUnit} from 'src/xlf/generator';

const templateParameters = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

const {
    template: [before, after],
    indentation,
} = generateTemplate(templateParameters);

describe('smoke', () => {
    it('works', () => {
        const transUnits = [
            {
                source: 'Sentence about something',
                target: 'Предложение о чем-то',
                id: 1,
                indentation,
            },
            {source: 'Text fragment', target: 'Фрагмент Текста', id: 1, indentation},
        ];
        const xlf = before + transUnits.map(generateTransUnit).join('') + after;

        parseTranslations({xlf});
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const transUnits = [
            {
                source: 'Sentence about something',
                target: 'Предложение о чем-то',
                id: 1,
                indentation,
            },
            {source: 'Text fragment', target: 'Фрагмент Текста', id: 1, indentation},
        ];
        const xlf = before + transUnits.map(generateTransUnit).join('') + after;

        parseTranslations({xlf});
    });

    it('throws on invalid parameters', () => {
        const invalidXLF = before + '</kek>' + after;

        expect(() => parseTranslations({xlf: ''})).toThrow();
        expect(() => parseTranslations({xlf: invalidXLF})).toThrow();
    });
});

describe('parses translation units', () => {
    it('parses targets', () => {
        const transUnits = [
            {
                source: 'Sentence about something',
                target: 'Предложение о чем-то',
                id: 1,
                indentation,
            },
            {source: 'Text fragment', target: 'Фрагмент Текста', id: 2, indentation},
        ];
        const xlf = before + transUnits.map(generateTransUnit).join('') + after;

        const translations = parseTranslations({xlf});

        for (const expected of transUnits) {
            const translation = translations.get(String(expected.id));
            if (!translation) {
                throw new Error(`failed to receive ${expected} translation unit`);
            }

            expect(translation).toStrictEqual(expected.target);
        }
    });

    it('parses trans-units', () => {
        const fixtures = [
            {id: 1, target: 'text segment 1'},
            {id: 2, target: 'text segment 2'},
        ];
        const xlf = before + fixtures.map(generateTransUnit).join('') + after;

        const translations = parseTranslations({xlf});

        for (const {id, target} of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(target);
        }
    });

    it('parses single trans-unit', () => {
        const fixtures = [{id: 1, target: 'text segment 1'}];
        const xlf = before + fixtures.map(generateTransUnit).join('') + after;

        const translations = parseTranslations({xlf});

        for (const {id, target} of fixtures) {
            const translation = translations.get(String(id));
            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(target);
        }
    });

    it('parses trans-units sources when trans-unit targets are absent', () => {
        const fixtures = [
            {id: 1, source: 'текст 1'},
            {id: 2, source: 'текст 2'},
        ];
        const xlf = before + fixtures.map(generateTransUnit).join('') + after;

        const translations = parseTranslations({xlf, useSource: true});
        for (const {id, source} of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(source);
        }
    });
});
