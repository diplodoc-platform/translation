import {generate, WrapperParameters} from './template';

describe('smoke', () => {
    it('works', () => {
        const parameters = {
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
            skeletonPath: 'file.skl.md',
            markdownPath: 'file.md',
        };

        generate(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
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

        generate(parameters);
    });

    it('throws on invalid parameters', () => {
        const invalidLocale = {
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'XX' as WrapperParameters['source']['locale'],
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
        };

        const invalidLanguage = {
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'xx' as WrapperParameters['target']['language'],
                locale: 'US' as const,
            },
        };

        expect(() => generate(invalidLanguage)).toThrow();
        expect(() => generate(invalidLocale)).toThrow();
    });
});

describe('template', () => {
    it('generates xlf template', () => {
        const parameters = {
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

        const {
            template: [before, after],
            indentation,
        } = generate(parameters);

        expect(indentation).toStrictEqual(4);
        expect(before).toMatchSnapshot();
        expect(after).toMatchSnapshot();
        expect(before + after).toMatchSnapshot();
    });
});
