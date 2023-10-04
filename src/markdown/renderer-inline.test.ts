import {render, RenderParameters} from './renderer';

describe('inline: markdown rendering', () => {
    it('inline: renders translated markdown instead of hashes inside of the sentences with plain text.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number one.'],
                ['2', 'Sentence number two.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders translated markdown instead of hashes inside of the sentences with links.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number one [link to file](file.md "title").'],
                ['2', 'Sentence number two.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders translated markdown instead of hashes inside of the sentences with bold.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number **one**.'],
                ['2', 'Sentence number **two**.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders translated markdown instead of hashes inside of the sentences with italics.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number *one*.'],
                ['2', 'Sentence number *two*.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders translated markdown instead of hashes inside of the sentences with strikethrough.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number ~~one~~.'],
                ['2', 'Sentence number ~~two~~.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders translated markdown instead of hashes inside of the sentences with superscript.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number ^one^.'],
                ['2', 'Sentence number ^two^.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders translated markdown instead of hashes inside of the sentences with monospace.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number ##one##.'],
                ['2', 'Sentence number ##two##.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders translated markdown instead of hashes inside of the sentences with inline code.', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number `one`.'],
                ['2', 'Sentence number `two`.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
