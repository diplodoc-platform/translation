import {render, RenderParameters} from './renderer';

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
