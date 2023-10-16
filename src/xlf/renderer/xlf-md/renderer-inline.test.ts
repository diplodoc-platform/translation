import {XLFMDRenderer} from './index';
import {XLFToken} from 'src/xlf/token';

describe('renders xlf to markdown', () => {
    it('renders plain text', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'text', data: 'Sentence about something. '},
            {type: 'text', data: 'Another sentence.'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders strong wrapped in <g> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'strong',
                equivText: '**',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'strong',
                equivText: '**',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders em wrapped in <g> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'em',
                equivText: '*',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'em',
                equivText: '*',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders s wrapped in <g> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 's',
                equivText: '~~',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 's',
                equivText: '~~',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });
});
