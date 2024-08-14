import {parse} from 'src/xliff';
import {extract} from 'src/api';
import {XLFToken} from 'src/xliff/token';

import {render as _render} from './index';

const tokenize = (markdown: string) => {
    const {xliff} = extract(markdown, {
        compact: true,
        source: {
            language: 'ru',
            locale: 'RU',
        },
        target: {
            language: 'en',
            locale: 'GB',
        },
    });

    const tokens = parse(xliff, {useSource: true});

    return tokens;
};

const render = (tokens: XLFToken[][]) => {
    const results = tokens.map(_render);

    return results.length === 1 ? results[0] : results;
};

describe('renders xliff to markdown', () => {
    it('renders plain text', () => {
        const tokens = tokenize('Sentence about something. Another sentence.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders strong wrapped in <x> tags', () => {
        const tokens = tokenize('Предложение номер **один**. Предложение номер **два**.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders em wrapped in <x> tags', () => {
        const tokens = tokenize('Предложение номер *один*. Предложение номер *два*.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders s wrapped in <x> tags', () => {
        const tokens = tokenize('Предложение номер ~~один~~. Предложение номер ~~два~~.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders sup wrapped in <x> tags', () => {
        const tokens = tokenize('Предложение номер ^один^. Предложение номер ^два^.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders samp wrapped in <x> tags', () => {
        const tokens = tokenize('Предложение номер ##один##. Предложение номер ##два##.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders code wrapped in <x> tag', () => {
        const tokens = tokenize('Предложение номер `один`. Предложение номер `два`.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders link with title wrapped in <x> tags', () => {
        const tokens = tokenize(
            'Предложение номер [один](one.md "one"). Предложение номер [два](two.md).',
        );

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders ref link wrapped in <x> tags', () => {
        const tokens = tokenize(
            'Предложение номер [[{#T}]](one.md "one"). Предложение номер [[{#T}]](two.md).',
        );

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders autolink wrapped in <x> tags', () => {
        const tokens = tokenize('Предложение номер один <https://www.google.com>.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders variable href link wrapped in <x> tags', () => {
        const tokens = tokenize('Предложение номер [один]({{one}} "one").');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders link containing multiple sentences wrapped in <x> tags', () => {
        const tokens = tokenize(
            '[Link text sentence one! Link text sentence Two?](file.md "Link title sentence one. Link title sentence two!").',
        );

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders image with all attributes wrapped in <x> tags', () => {
        const tokens = tokenize('Sentence ![image](image.png "hint" =100x100).');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders video wrapped in <x> tags', () => {
        const tokens = tokenize('Another sentence @[youtube](rJz4OaURJ6U)');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders heading with anchor wrapped in <x> tags', () => {
        const tokens = tokenize('# Heading with anchors {#anchor1} {#anchor2}');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders file wrapped in <x> tags', () => {
        const tokens = tokenize(
            'Sentence with {% file src="path/to/file" name="readme.md" referrerpolicy="no-referrer" rel="noopener" target="_blank" type="text/plain" %}.',
        );

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders liquid conditions wrapped in <x> tags', () => {
        const tokens = tokenize(
            'Sentence with {% if var == "val" %} val {% else %} other val {% endif %}.',
        );

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders liquid loop wrapped in <x> tags', () => {
        const tokens = tokenize('Sentence {% for x in xs %} x {% endfor %}.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders liquid function wrapped in <x> tags', () => {
        const tokens = tokenize('Sentence with function {{ user.name.slice(1, 2) }}.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders liquid filter wrapped in <x> tags', () => {
        const tokens = tokenize('Sentence with filter {{ users | length }}.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders liquid variables wrapped in <x> tags', () => {
        const tokens = tokenize('Sentence with {{ variable }}.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('renders inline html wrapped in <x> tags', () => {
        const tokens = tokenize('Sentence<br>with <b>html</b>.');

        expect(render(tokens)).toMatchSnapshot();
    });

    it('parses inline code with liquid syntax wrapped in <x> tags', () => {
        const tokens = tokenize(
            'Sentence `{{ ui-key.yacloud.common.label_tcp }} other`. Another sentence `{{user.name | capitalize}} other`.',
        );

        expect(render(tokens)).toMatchSnapshot();
    });
});
