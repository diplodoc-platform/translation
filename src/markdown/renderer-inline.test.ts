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
});
