import {render, RenderParameters} from './renderer';

import basic from 'src/__fixtures__/basic';
import variables from 'src/__fixtures__/variables';
import filters from 'src/__fixtures__/filters';
import functions from 'src/__fixtures__/functions';
import conditionals from 'src/__fixtures__/conditionals';
import loops from 'src/__fixtures__/loops';
import meta from 'src/__fixtures__/meta';
import notes from 'src/__fixtures__/notes';
import cuts from 'src/__fixtures__/cuts';

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

        const invalidLang = {
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
            lang: 'xx',
        } as RenderParameters;

        expect(() => render(parameters)).toThrow();
        expect(() => render(invalidLang)).toThrow();
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
            markdown: basic.markdown,
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

    // naive approach leaves variables inside of text as is
    it('handles markdown with liquid variables', () => {
        const parameters = {
            markdown: variables.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('handles markdown with liquid filters', () => {
        const parameters = {
            markdown: filters.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('handles markdown with liquid functions', () => {
        const parameters = {
            markdown: functions.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('handles markdown with liquid conditionals', () => {
        const parameters = {
            markdown: conditionals.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('handles markdown with liquid loops', () => {
        const parameters = {
            markdown: loops.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('handles markdown with meta', () => {
        const parameters = {
            markdown: meta.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('handles markdown with notes', () => {
        const parameters = {
            markdown: notes.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('handles markdown with cuts', () => {
        const parameters = {
            markdown: cuts.markdown,
            source: {
                language: 'en',
                locale: 'US' as const,
            },
            target: {
                language: 'ru',
                locale: 'RU' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
