import {render, RenderParameters} from './renderer';
import {
    markdown,
    markdownWithVariables,
    markdownWithConditionals,
    markdownWithLoops,
    markdownWithFilters,
    markdownWithFunctions,
    markdownWithMeta,
    markdownWithNotes,
    markdownWithCuts,
} from 'src/__fixtures__';

describe('smoke', () => {
    test('it works', () => {
        const parameters = {
            markdown: '1',
        };

        render(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            markdown: '1',
        };

        render(parameters);
    });

    it('throws on invalid parameters', () => {
        const parameters = {} as RenderParameters;

        expect(() => render(parameters)).toThrow();
    });
});

describe('skeleton rendering', () => {
    it('renders hashes instead of content of the text tokens', () => {
        const parameters = {
            markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid variables', () => {
        const parameters = {
            markdown: markdownWithVariables,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid filters', () => {
        const parameters = {
            markdown: markdownWithFilters,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid functions', () => {
        const parameters = {
            markdown: markdownWithFunctions,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid conditionals', () => {
        const parameters = {
            markdown: markdownWithConditionals,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with loops', () => {
        const parameters = {
            markdown: markdownWithLoops,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with meta', () => {
        const parameters = {
            markdown: markdownWithMeta,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with notes', () => {
        const parameters = {
            markdown: markdownWithNotes,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with cuts', () => {
        const parameters = {
            markdown: markdownWithCuts,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
