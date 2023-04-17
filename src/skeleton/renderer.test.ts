import {render, RenderParameters} from './renderer';
import {text} from 'src/__fixtures__';

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
            markdown: text,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
