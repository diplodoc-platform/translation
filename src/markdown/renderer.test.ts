import {render, RenderParameters} from './renderer';
import {
    skeleton,
    skeletonWithVariables,
    translations,
    translationsWithVariables,
    skeletonWithConditionals,
    translationsWithConditionals,
    skeletonWithLoops,
    translationsWithLoops,
} from 'src/__fixtures__';

describe('smoke', () => {
    test('it works', () => {
        const parameters = {
            skeleton: '',
            translations: new Map<string, string>(),
        };

        render(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            skeleton: '',
            translations: new Map<string, string>(),
        };

        render(parameters);
    });

    it('throws on invalid parameters', () => {
        const parameters = {} as RenderParameters;
        expect(() => render(parameters)).toThrow();
    });
});

describe('markdown rendering', () => {
    it('renders identital markdown without translations', () => {
        const parameters = {
            skeleton: '# title\nhello, world\n',
            translations: new Map<string, string>([
                ['1', 'титул'],
                ['2', 'привет, мир'],
            ]),
        };

        const generated = render(parameters);

        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes', () => {
        const parameters = {
            skeleton,
            translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with liquid variables in text', () => {
        const parameters = {
            skeleton: skeletonWithVariables,
            translations: translationsWithVariables,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with liquid conditionals in text', () => {
        const parameters = {
            skeleton: skeletonWithConditionals,
            translations: translationsWithConditionals,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated txt instead of hashes, with liquid loops in text', () => {
        const parameters = {
            skeleton: skeletonWithLoops,
            translations: translationsWithLoops,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });
});
