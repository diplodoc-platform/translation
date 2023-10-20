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

    it('renders sup wrapped in <g> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'sup',
                equivText: '^',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'sup',
                equivText: '^',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders samp wrapped in <g> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'samp',
                equivText: '##',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'samp',
                equivText: '##',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders code wrapped in <x> tag', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'open',
                syntax: 'code',
                equivText: '`один`',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders link wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_text_part',
                equivText: '[]',
            },
            {type: 'text', data: 'два'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_text_part',
                equivText: '[]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'link_attributes_href',
                equivText: 'two.md',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders link with title wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_text_part',
                equivText: '[]',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_text_part',
                equivText: '[]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'link_attributes_href',
                equivText: 'one.md',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_attributes_title',
                equivText: '""',
            },
            {type: 'text', data: 'one'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_attributes_title',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders ref link wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'link_reflink',
                equivText: '[{#T}]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'link_attributes_href',
                equivText: 'one.md',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_attributes_title',
                equivText: '""',
            },
            {type: 'text', data: 'one'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_attributes_title',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders autolink wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер один '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'link_autolink',
                equivText: '<https://www.google.com>',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders variable href link wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_text_part',
                equivText: '[]',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_text_part',
                equivText: '[]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'link_attributes_href',
                equivText: '{{one}}',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'link_attributes_title',
                equivText: '""',
            },
            {type: 'text', data: 'one'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_attributes_title',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'link_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });
});
