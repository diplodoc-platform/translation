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
import gfmTables from 'src/__fixtures__/gfm-tables';
import sup from 'src/__fixtures__/sup';

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
        const invalidLang = {
            skeleton: '',
            translations: new Map<string, string>(),
            lang: 'xx',
        } as RenderParameters;
        expect(() => render(parameters)).toThrow();
        expect(() => render(invalidLang)).toThrow();
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
            skeleton: basic.skeleton,
            translations: basic.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with liquid variables in text', () => {
        const parameters = {
            skeleton: variables.skeleton,
            translations: variables.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with liquid filters in text', () => {
        const parameters = {
            skeleton: filters.skeleton,
            translations: filters.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with liquid functions in text', () => {
        const parameters = {
            skeleton: functions.skeleton,
            translations: functions.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with liquid conditionals in text', () => {
        const parameters = {
            skeleton: conditionals.skeleton,
            translations: conditionals.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated txt instead of hashes, with liquid loops in text', () => {
        const parameters = {
            skeleton: loops.skeleton,
            translations: loops.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with meta in text', () => {
        const parameters = {
            skeleton: meta.skeleton,
            translations: meta.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with notes in text', () => {
        const parameters = {
            skeleton: notes.skeleton,
            translations: notes.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with cuts in text', () => {
        const parameters = {
            skeleton: cuts.skeleton,
            translations: cuts.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with gfm tables in text', () => {
        const parameters = {
            skeleton: gfmTables.skeleton,
            translations: gfmTables.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with sup syntax in text', () => {
        const parameters = {
            skeleton: sup.skeleton,
            translations: sup.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });
});
