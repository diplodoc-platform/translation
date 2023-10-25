import {ExtractParameters, extract} from './extract';

describe('smoke', () => {
    it('works', () => {
        const parameters = {
            markdown: '1',
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
        };

        extract(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            markdown: '1',
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
        };

        const {xlf, skeleton} = extract(parameters);

        expect(xlf).not.toBe('');
        expect(skeleton).not.toBe('');
    });

    it('throws on invalid parameters', () => {
        const invalidLocale = {
            markdown: 'x',
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'us',
                locale: 'XX' as ExtractParameters['target']['locale'],
            },
        };

        const invalidLanguage = {
            markdown: 'x',
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'xx' as ExtractParameters['target']['language'],
                locale: 'US' as const,
            },
        };

        const invalidLang = {
            markdown: '1',
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
            lang: 'xx',
        };

        expect(() => extract(invalidLanguage)).toThrow();
        expect(() => extract(invalidLocale)).toThrow();
        expect(() => extract(invalidLang)).toThrow();
    });
});
