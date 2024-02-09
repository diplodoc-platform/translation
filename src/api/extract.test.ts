import {ExtractParams, extract} from './extract';

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

        const {xliff, skeleton} = extract(parameters);

        expect(xliff).not.toBe('');
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
                locale: 'XX' as ExtractParams['target']['locale'],
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
                language: 'xx' as ExtractParams['target']['language'],
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
    });
});
