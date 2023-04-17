import {translationUnits} from './parser';
import {template, transUnit} from './generator';

const templateParameters = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

const {
    template: [before, after],
    indentation,
} = template.generate(templateParameters);

const transUnits = [
    {source: 'Sentence about something', target: 'Предложение о чем-то', id: 0, indentation},
    {source: 'Text fragment', target: 'Фрагмент Текста', id: 1, indentation},
];

const xlf = before + transUnits.map(transUnit.generate).join('') + after;

describe('smoke', () => {
    it('works', () => {
        translationUnits({xlf});
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        translationUnits({xlf});
    });

    it('throws on invalid parameters', () => {
        const invalidXLF = before + '</kek>' + after;

        expect(() => translationUnits({xlf: ''})).toThrow();
        expect(() => translationUnits({xlf: invalidXLF})).toThrow();
    });
});

describe('parses translation units', () => {
    it('parses targets', () => {
        const translations = translationUnits({xlf});

        for (const expected of transUnits) {
            const translation = translations.get(String(expected.id));
            if (!translation) {
                throw new Error(`failed to receive ${expected} translation unit`);
            }

            expect(translation).toStrictEqual(expected.target);
        }
    });
});
