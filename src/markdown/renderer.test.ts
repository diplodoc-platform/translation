import {RenderParameters, render} from './renderer';

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
import checkbox from 'src/__fixtures__/checkbox';
import anchors from 'src/__fixtures__/anchors';
import monospace from 'src/__fixtures__/monospace';
import imsize from 'src/__fixtures__/imsize';
import file from 'src/__fixtures__/file';
import links from 'src/__fixtures__/links';
import includes from 'src/__fixtures__/includes';
import strikethrough from 'src/__fixtures__/strikethrough';
import tabs from 'src/__fixtures__/tabs';
import video from 'src/__fixtures__/video';
import multilineTables from 'src/__fixtures__/multiline-tables';

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

    it('renders translated text instead of hashes, with checkbox syntax in text', () => {
        const parameters = {
            skeleton: checkbox.skeleton,
            translations: checkbox.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with anchors syntax in text', () => {
        const parameters = {
            skeleton: anchors.skeleton,
            translations: anchors.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with monospace syntax in text', () => {
        const parameters = {
            skeleton: monospace.skeleton,
            translations: monospace.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with imsize syntax in text', () => {
        const parameters = {
            skeleton: imsize.skeleton,
            translations: imsize.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with file syntax in text', () => {
        const parameters = {
            skeleton: file.skeleton,
            translations: file.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with ref links({#T}) syntax in text', () => {
        const parameters = {
            skeleton: links.skeleton,
            translations: links.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, ignoring {% include ... %} syntax in text', () => {
        const parameters = {
            skeleton: includes.skeleton,
            translations: includes.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with striketrough syntax in text', () => {
        const parameters = {
            skeleton: strikethrough.skeleton,
            translations: strikethrough.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with tabs syntax in text', () => {
        const parameters = {
            skeleton: tabs.skeleton,
            translations: tabs.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with video syntax in text', () => {
        const parameters = {
            skeleton: video.skeleton,
            translations: video.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });

    it('renders translated text instead of hashes, with multiline tables syntax in text', () => {
        const parameters = {
            skeleton: multilineTables.skeleton,
            translations: multilineTables.translations,
        };

        const generated = render(parameters);
        expect(generated).toMatchSnapshot();
    });
});
