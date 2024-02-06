import {ComposeParams, compose} from './compose';
import {XLF} from 'src/xliff';

const templateParams = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

const transUnits = [
    {source: 'Sentence about something', target: 'Предложение о чем-то', id: 0},
    {source: 'Text fragment', target: 'Фрагмент Текста', id: 1},
];

const xliff = XLF.generate(templateParams, transUnits.map(XLF.generateTransUnit));

describe('smoke', () => {
    it('works', () => {
        const parameters = {
            skeleton: '%%%1%%%',
            xliff: xliff,
        };

        compose(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            skeleton: '%%%1%%%',
            xliff: xliff,
            useSource: true,
        };

        compose(parameters);
    });

    it('throws on invalid parameters', () => {
        const invalidXLF = {
            xliff: '',
        };
        const invalidSkeleton = {
            xliff: xliff,
        };
        const invalidLang = {xliff, skeleton: '', lang: 'xx'};
        const invalidUseSource = {xliff, useSource: null};

        expect(() => compose(invalidSkeleton as ComposeParams)).toThrow();
        expect(() => compose(invalidXLF as ComposeParams)).toThrow();
        expect(() => compose(invalidLang as ComposeParams)).toThrow();
        expect(() => compose(invalidUseSource as unknown as ComposeParams)).toThrow();
    });
});
