import {render, RenderParameters} from './renderer';

import {markdown} from 'src/__fixtures__';

describe('smoke', () => {
    test('it works', () => {
        const parameters = {
            markdown: '',
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

        render(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            markdown: '',
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

        render(parameters);
    });

    it('throws on invalid parameters', () => {
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
        } as RenderParameters;

        expect(() => render(parameters)).toThrow();
    });
});

describe('xlf rendering', () => {
    it('renders empty xlf document for empty markdown', () => {
        const parameters = {
            markdown: '',
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

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders trans-units from text tokens', () => {
        const parameters = {
            markdown,
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
