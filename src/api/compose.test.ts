import {compose, ComposeParameters} from './compose';

describe('smoke', () => {
    it('works', () => {
        const parameters = {
            skeleton: '',
            xlf: '',
        };

        compose(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            skeleton: '',
            xlf: '',
        };

        compose(parameters);
    });

    it('throws on invalid parameters', () => {
        const invalidSkeleton = {
            xlf: '',
        };

        const invalidXLF = {
            skeleton: '',
        };

        const invalidBoth = {};

        expect(() => compose(invalidSkeleton as ComposeParameters)).toThrow();
        expect(() => compose(invalidXLF as ComposeParameters)).toThrow();
        expect(() => compose(invalidBoth as ComposeParameters)).toThrow();
    });
});
