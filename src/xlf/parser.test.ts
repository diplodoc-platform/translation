import {translationUnits} from './parser';
import {template} from './generator';

const transUnits = [
    {source: 'Sentence about something', target: 'Предложение о чем-то', id: 0},
    {source: 'Text fragment', target: 'Фрагмент Текста', id: 1},
];

const templateParameters = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

type GenerateTranslationUnitsParameters = {source: string; target: string; id: number};

function generateTransUnit(indent: number) {
    return ({source, target, id}: GenerateTranslationUnitsParameters) =>
        ' '.repeat(indent) +
        `<trans-unit id="${id}">\n` +
        ' '.repeat(indent + 2) +
        `<source>${source}</source>\n` +
        ' '.repeat(indent + 2) +
        `<target>${target}</target>\n` +
        ' '.repeat(indent) +
        '</trans-unit>\n';
}

describe('smoke', () => {
    it('works', () => {
        const {
            template: [before, after],
            indentation,
        } = template.generate(templateParameters);

        const generator = generateTransUnit(indentation);

        const xlf = before + transUnits.map(generator).join('') + after;
        translationUnits({xlf});
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const {
            template: [before, after],
            indentation,
        } = template.generate(templateParameters);

        const generator = generateTransUnit(indentation);

        const xlf = before + transUnits.map(generator).join('') + after;
        translationUnits({xlf});
    });

    it('throws on invalid parameters', () => {
        const {
            template: [before, after],
            indentation,
        } = template.generate(templateParameters);

        const generator = generateTransUnit(indentation);

        const xlf = before + '</kek>' + transUnits.map(generator).join('') + after;
        expect(() => translationUnits({xlf: ''})).toThrow();
        expect(() => translationUnits({xlf})).toThrow();
    });
});

describe('parses translation units', () => {
    it('parses targets', () => {
        const {
            template: [before, after],
            indentation,
        } = template.generate(templateParameters);

        const generator = generateTransUnit(indentation);
        const xlf = before + transUnits.map(generator).join('') + after;
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
