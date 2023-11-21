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

    it('renders code wrapped in <g> tag', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Предложение номер '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'code',
                equivText: '`',
            },
            {type: 'text', data: 'один'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'code',
                equivText: '`',
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

    it('renders image with all attributes wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {type: 'text', data: 'image'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_src',
                equivText: 'image.png',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {type: 'text', data: 'hint'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_size',
                equivText: '=100x50',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders image with src title and height size wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {type: 'text', data: 'image'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_src',
                equivText: 'image.png',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {type: 'text', data: 'hint'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_size',
                equivText: '=x100',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders image with src title and width size wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {type: 'text', data: 'image'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_src',
                equivText: 'image.png',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {type: 'text', data: 'hint'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_size',
                equivText: '=100x',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders image with src and size wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {type: 'text', data: 'image'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_src',
                equivText: 'image.png',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_size',
                equivText: '=100x100',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders image with src and title wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {type: 'text', data: 'image'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_src',
                equivText: 'image.png',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {type: 'text', data: 'hint'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_title',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders image with src wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {type: 'text', data: 'image'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'image_attributes_src',
                equivText: 'image.png',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders empty image wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_text_part',
                equivText: '![]',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'image_attributes_part',
                equivText: '()',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders video wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Another sentence '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'video',
                equivText: '@[youtube](rJz4OaURJ6U)',
            },
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders heading with anchor wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Heading with anchors'},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'anchor',
                equivText: ' {#anchor1}',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'anchor',
                equivText: ' {#anchor2}',
            },
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders file wrapped in <g> and <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence with '},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'file',
                equivText: '{%%}',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'file_src',
                equivText: ' src="path/to/file"',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'open',
                syntax: 'file_name',
                equivText: '""',
            },
            {type: 'text', data: 'readme.md'},
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'file_name',
                equivText: '""',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'file_referrerpolicy',
                equivText: ' referrerpolicy="no-referrer"',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'file_rel',
                equivText: ' rel="noopener"',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'file_target',
                equivText: ' target="_blank"',
            },
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'file_type',
                equivText: ' type="text/plain"',
            },
            {
                type: 'tag',
                data: 'g',
                nodeType: 'close',
                syntax: 'file',
                equivText: '{%%}',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid conditions wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence with '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_If',
                equivText: '{% if var == "val" %}',
            },
            {type: 'text', data: ' val '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_Else',
                equivText: '{% else %}',
            },
            {type: 'text', data: ' other val '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_EndIf',
                equivText: '{% endif %}',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid loop wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_ForInLoop',
                equivText: '{% for x in xs %}',
            },
            {type: 'text', data: ' x '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_EndForInLoop',
                equivText: '{% endfor %}',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid function wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence with function '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_Function',
                equivText: '{{ user.name.slice(1, 2) }}',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid filter wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence with filter '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_Filter',
                equivText: '{{ users | length }}',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('renders liquid variables wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence with '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'liquid_Variable',
                equivText: '{{ variable }}',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });
});
