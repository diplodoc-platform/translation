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

    it('renders strong wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'strong_open',
                    equivText: '**',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'strong_close',
                    equivText: '**',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'strong_open',
                    equivText: '**',
                },
                {type: 'text', data: 'два'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'strong_close',
                    equivText: '**',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];
        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders em wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'em_open',
                    equivText: '*',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'em_close',
                    equivText: '*',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'em_open',
                    equivText: '*',
                },
                {type: 'text', data: 'два'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'em_close',
                    equivText: '*',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];
        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders s wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 's_open',
                    equivText: '~~',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 's_close',
                    equivText: '~~',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 's_open',
                    equivText: '~~',
                },
                {type: 'text', data: 'два'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 's_close',
                    equivText: '~~',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];

        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders sup wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'sup_open',
                    equivText: '^',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'sup_close',
                    equivText: '^',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'sup_open',
                    equivText: '^',
                },
                {type: 'text', data: 'два'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'sup_close',
                    equivText: '^',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];

        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders samp wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'samp_open',
                    equivText: '##',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'samp_close',
                    equivText: '##',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'samp_open',
                    equivText: '##',
                },
                {type: 'text', data: 'два'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'samp_close',
                    equivText: '##',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];
        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders code wrapped in <x> tag', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_open',
                    equivText: '`',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_close',
                    equivText: '`',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_open',
                    equivText: '`',
                },
                {type: 'text', data: 'два'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_close',
                    equivText: '`',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];

        const rendered: Array<string> = [];

        for (const token of tokenUnits) {
            rendered.push(renderer.render(token));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders link with title wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_open',
                    equivText: '[',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_close',
                    equivText: ']',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_open',
                    equivText: '(',
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_open',
                    equivText: '"',
                },
                {type: 'text', data: 'one'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_close',
                    equivText: '"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_close',
                    equivText: ')',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_open',
                    equivText: '[',
                },
                {type: 'text', data: 'два'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_close',
                    equivText: ']',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_open',
                    equivText: '(',
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_close',
                    equivText: ')',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];
        const rendered: Array<string> = [];
        for (const token of tokenUnits) {
            rendered.push(renderer.render(token));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders ref link wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_open',
                    equivText: '(',
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_open',
                    equivText: '"',
                },
                {type: 'text', data: 'one'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_close',
                    equivText: '"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_close',
                    equivText: ')',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_open',
                    equivText: '(',
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_close',
                    equivText: ')',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];

        const rendered: Array<string> = [];
        for (const token of tokenUnits) {
            rendered.push(renderer.render(token));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders autolink wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
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
            ],
        ];

        const rendered: Array<string> = [];
        for (const token of tokenUnits) {
            rendered.push(renderer.render(token));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders variable href link wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Предложение номер '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_open',
                    equivText: '[',
                },
                {type: 'text', data: 'один'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_close',
                    equivText: ']',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_open',
                    equivText: '(',
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_open',
                    equivText: '"',
                },
                {type: 'text', data: 'one'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_close',
                    equivText: '"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_close',
                    equivText: ')',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];
        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders link containing multiple sentences wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_open',
                    equivText: '[',
                },
                {type: 'text', data: 'Link text sentence one!'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Link text sentence Two?'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_text_part_close',
                    equivText: ']',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_open',
                    equivText: '(',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_href',
                    equivText: 'file.md',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_open',
                    equivText: '"',
                },
                {type: 'text', data: 'Link title sentence one.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Link title sentence two!'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_title_close',
                    equivText: '"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'link_attributes_part_close',
                    equivText: ')',
                },
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];

        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });

    it('renders image with all attributes wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Sentence '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'image_text_part_open',
                    equivText: '![',
                },
                {type: 'text', data: 'image'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'image_text_part_close',
                    equivText: ']',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'image_attributes_part_open',
                    equivText: '(',
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
                    syntax: 'image_attributes_title_open',
                    equivText: '"',
                },
                {type: 'text', data: 'hint'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'image_attributes_title_close',
                    equivText: '"',
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
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'image_attributes_part_close',
                    equivText: ')',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];
        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

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

    it('renders file wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Sentence with '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_open',
                    equivText: '{%',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_src',
                    equivText: 'src="path/to/file"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_name_open',
                    equivText: 'name="',
                },
                {type: 'text', data: 'readme.md'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_name_close',
                    equivText: '"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_referrerpolicy',
                    equivText: 'referrerpolicy="no-referrer"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_rel',
                    equivText: 'rel="noopener"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_target',
                    equivText: 'target="_blank"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_type',
                    equivText: 'type="text/plain"',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'file_close',
                    equivText: '%}',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];

        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

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

    it('renders inline html wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokens: Array<XLFToken> = [
            {type: 'tag', data: 'target', nodeType: 'open'},
            {type: 'text', data: 'Sentence'},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'html_inline',
                equivText: '<br>',
            },
            {type: 'text', data: 'with '},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'html_inline',
                equivText: '<b>',
            },
            {type: 'text', data: 'html'},
            {
                type: 'tag',
                data: 'x',
                nodeType: 'self-closing',
                syntax: 'html_inline',
                equivText: '</b>',
            },
            {type: 'text', data: '.'},
            {type: 'tag', data: 'target', nodeType: 'close'},
        ];

        const rendered = renderer.render(tokens);
        expect(rendered).toMatchSnapshot();
    });

    it('parses inline code with liquid syntax wrapped in <x> tags', () => {
        const renderer = new XLFMDRenderer();
        const tokenUnits: Array<Array<XLFToken>> = [
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Sentence '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_open',
                    equivText: '`',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'liquid_Variable',
                    equivText: '{{ ui-key.yacloud.common.label_tcp }}',
                },
                {type: 'text', data: ' other'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_close',
                    equivText: '`',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
            [
                {type: 'tag', data: 'target', nodeType: 'open'},
                {type: 'text', data: 'Another sentence '},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_open',
                    equivText: '`',
                },
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'liquid_Filter',
                    equivText: '{{user.name | capitalize}}',
                },
                {type: 'text', data: ' other'},
                {
                    type: 'tag',
                    data: 'x',
                    nodeType: 'self-closing',
                    syntax: 'code_close',
                    equivText: '`',
                },
                {type: 'text', data: '.'},
                {type: 'tag', data: 'target', nodeType: 'close'},
            ],
        ];
        const rendered: Array<string> = [];

        for (const tokens of tokenUnits) {
            rendered.push(renderer.render(tokens));
        }

        expect(rendered).toMatchSnapshot();
    });
});
