import {render, RenderParameters} from './renderer';

describe('inline: markdown rendering', () => {
    it('inline: renders translated markdown instead of hashes inside of the sentences with plain text', () => {
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
});
