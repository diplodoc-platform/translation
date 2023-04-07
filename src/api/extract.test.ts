import {extract, LanguageLocale, ExtractParameters} from './extract';

describe('smoke', () => {
    it('works', () => {
        const parameters = {
            markdown: '1',
            source: {
                language: 'ru',
                locale: 'RU',
            } as LanguageLocale,
            target: {
                language: 'en',
                locale: 'US',
            } as LanguageLocale,
        };

        extract(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            markdown: '1',
            source: {
                language: 'ru',
                locale: 'RU',
            } as LanguageLocale,
            target: {
                language: 'en',
                locale: 'US',
            } as LanguageLocale,
        };

        extract(parameters);
    });

    it('throws on invalid parameters', () => {
        const invalidPath = {
            markdown: '1',
            path: '',
            source: {
                language: 'ru',
                locale: 'RU',
            } as LanguageLocale,
            target: {
                language: 'xx',
                locale: 'US',
            } as LanguageLocale,
        };

        const invalidMarkdown = {
            source: {
                language: 'ru',
                locale: 'RU',
            } as LanguageLocale,
            target: {
                language: 'xx',
                locale: 'US',
            } as LanguageLocale,
        };

        expect(() => extract(invalidPath)).toThrow();
        expect(() => extract(invalidMarkdown as ExtractParameters)).toThrow();
    });
});
