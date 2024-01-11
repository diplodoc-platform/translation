import {TemplateParameters, generateTemplate} from './template';

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

        generateTemplate(parameters, []);
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

        generateTemplate(parameters, []);
    });

    it('throws on invalid parameters', () => {
        const invalidLocale = {
            markdownPath: 'file.md',
            skeletonPath: 'file.skl.md',
            source: {
                language: 'ru',
                locale: 'XX' as TemplateParameters['source']['locale'],
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
                language: 'xx' as TemplateParameters['target']['language'],
                locale: 'US' as const,
            },
        };

        expect(() => generateTemplate(invalidLanguage, [])).toThrow();
        expect(() => generateTemplate(invalidLocale, [])).toThrow();
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

        const template = generateTemplate(parameters, []);

        expect(template).toMatchSnapshot();
    });
});
