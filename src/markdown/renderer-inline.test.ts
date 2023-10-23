import {render, RenderParameters} from './renderer';

describe('inline: renders translated markdown', () => {
    it('inline: renders sentences with plain text', () => {
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

    it('inline: renders sentences with strong syntax', () => {
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

    it('inline: renders sentences with em syntax', () => {
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

    it('inline: renders sentences with s syntax', () => {
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

    it('inline: renders sentences with sup syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number^one^.'],
                ['2', 'Sentence number^two^.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with samp syntax', () => {
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

    it('inline: renders sentences with code syntax', () => {
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

    it('inline: renders sentences with links syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number [one](one.md "one").'],
                ['2', 'Sentence number [two](two.md "two").'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with ref links syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number [{#T}](one.md "one").'],
                ['2', 'Sentence number [{#T}](two.md).'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with autolink syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number one <https://www.google.com>.'],
                ['2', 'Sentence number two <https://www.youtube.com>.'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with variale href link syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence number [one]({{one}}).'],
                ['2', 'Sentence number [two]({{ two }}).'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('inline: renders sentences with variale image syntax', () => {
        const parameters: RenderParameters = {
            skeleton: '%%%1%%% %%%2%%% %%%3%%% %%%4%%% %%%5%%% %%%6%%%',
            translations: new Map<string, string>([
                ['1', 'Sentence ![image](_images/image.png "текст_подсказки" =100x100).'],
                ['2', 'Sentence ![image](_images/image.png "текст_подсказки" =x100).'],
                ['3', 'Sentence ![image](_images/image.png "текст_подсказки" =100x).'],
                ['4', 'Sentence ![image](_images/image.png =100x100).'],
                ['5', 'Sentence ![image](_images/image.png).'],
                ['6', 'Sentence ![]().'],
            ]),
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
