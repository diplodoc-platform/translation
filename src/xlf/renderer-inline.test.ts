import {render, RenderParameters} from './renderer';

describe('inline: xlf rendering', () => {
    it('inline: renders trans-unit for each sentence from paragraph with plain text.', () => {
        const parameters: RenderParameters = {
            markdown: 'Предложение номер один. Предложение номер два.',
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
            markdownPath: 'text.md',
            skeletonPath: 'text.skl.md',
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});
