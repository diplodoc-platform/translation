import MarkdownIt from 'markdown-it';
import transform from '@diplodoc/transform';
import {load} from 'cheerio';
import {describe, expect, it} from 'vitest';

import {compose, extract} from 'src/api';

import {experimentPlugins, skeletonPlugins} from './transform-plugins';

const template = {
    source: {language: 'en' as const, locale: 'US' as const},
    target: {language: 'ru' as const, locale: 'RU' as const},
    originalFile: 'inline.md',
    skeletonFile: 'inline.skl',
};

function extracted(source: string, experimental: boolean, compact: boolean) {
    const result = experimental
        ? extract(source, {...template, compact, useExperimentalParser: true})
        : extract(source, {...template, compact});
    const xml = result.xliff.toString();
    const render = (content: string) =>
        experimental
            ? compose(result.skeleton, content, {
                  useExperimentalParser: true,
                  useSource: true,
              }).document
            : compose(result.skeleton, content, {useSource: true});
    const target = (content: string) => {
        const payload = content
            .replace(/<source\b/g, '<target')
            .replaceAll('</source>', '</target>');
        return experimental
            ? compose(result.skeleton, payload, {useExperimentalParser: true, useSource: false})
                  .document
            : compose(result.skeleton, payload, {useSource: false});
    };
    return {xml, skeleton: result.skeleton, render, target};
}

describe.each([false, true])('actual inline extraction (experimental=%s)', (experimental) => {
    it.each([false, true])(
        'keeps delimiters structural and translates only text (compact=%s)',
        (compact) => {
            const source = 'Lead ++Title **bold**++ and H~two~O [++Link++ label](/target).\n';
            const result = extracted(source, experimental, compact);
            expect(result.xml).toContain('x-begin="++"');
            expect(result.xml).toContain('x-end="++"');
            expect(result.xml).toContain('x-begin="~"');
            expect(result.xml).toContain('x-end="~"');
            expect(result.xml).not.toContain('&lt;u&gt;');
            expect(result.xml).not.toContain('&lt;sub&gt;');
            expect(result.render(result.xml)).toBe(source);
            expect(
                result.target(result.xml.replaceAll('Title', 'Заголовок').replaceAll('two', 'два')),
            ).toBe('Lead ++Заголовок **bold**++ and H~два~O [++Link++ label](/target).\n');
        },
    );

    it.each([
        ['Lead ~a\\ b~ and text.\n', 'a\\ b', 'c\\ d', 'Lead ~c\\ d~ and text.\n'],
        ['Lead ~a\\\\b~ and text.\n', 'a\\\\b', 'c\\\\d', 'Lead ~c\\\\d~ and text.\n'],
    ])('translates escaped plain body bytes for %s', (source, before, after, expected) => {
        const result = extracted(source, experimental, true);
        expect(result.target(result.xml.replaceAll(before, after))).toBe(expected);
    });

    describe.each([false, true])('subscript target constraints (compact=%s)', (compact) => {
        it.each(['~two~\n', 'Lead H~two~O.\n', 'Before. ~two~ After.\n'])(
            'keeps source context for whole, embedded and sentence-boundary units: %s',
            (source) => {
                const result = extracted(source, experimental, compact);
                expect(result.render(result.xml)).toBe(source);
                const target = result.xml.replaceAll('two', 'two words');
                const expected = source.replace('two', 'two\\ words');
                expect(result.target(target)).toBe(expected);
                expect(result.target(target)).toBe(expected);
                expect(load(transform(expected).result.html)('sub').text()).toBe('two words');
            },
        );

        it.each([
            ['a~b', 'a\\~b', 'a~b'],
            ['tail\\', 'tail\\\\', 'tail\\'],
            ['a\\ b', 'a\\ b', 'a b'],
            ['слово два', 'слово\\ два', 'слово два'],
        ])('composes a target body with literal escapes: %s', (targetBody, sourceBody, visible) => {
            const result = extracted('Lead ~two~ body.\n', experimental, compact);
            const output = result.target(result.xml.replaceAll('two', targetBody));
            expect(output).toBe(`Lead ~${sourceBody}~ body.\n`);
            expect(load(transform(output).result.html)('sub').text()).toBe(visible);
        });

        it.each(['a\nb', 'a\rb', 'a\tb', 'a\u00a0b'])(
            'rejects unsupported raw target whitespace with a subscript-specific error: %j',
            (targetBody) => {
                const result = extracted('Lead ~two~ body.\n', experimental, compact);
                expect(() => result.target(result.xml.replaceAll('two', targetBody))).toThrow(
                    /subscript.*whitespace/i,
                );
            },
        );
    });

    it.each([
        '~two~\n',
        '++Underlined++\n',
        '~First\\ sentence.\\ Another~\n',
        '~a\\~b~\n',
        '~tail\\\\~\n',
        '~a\\\tb~\n',
        '~a\\\nb~\n',
        '~a\\\u00a0b~\n',
        '~\\ space\\ ~\n',
        'Lead ~a\\ b~ and text.\n',
        'Lead ~a\\\\b~ and text.\n',
        '😀 ++Unicode++ H~два~O.\n',
        'Lead ++text _emphasis_++ [H~two~O](/target).\n',
        'Literal \\~escaped~ and \\+\\+escaped++ H~two~O.\n',
        '`++literal++ ~body~`\n\n~~~\n++literal++ H~body~O\n~~~\n',
        '# ++Title++ H~two~O {#title}\n\nBody ++text++.\n',
    ])('roundtrips native source bytes for %s', (source) => {
        const result = extracted(source, experimental, true);
        expect(result.render(result.xml)).toBe(source);
    });
});

describe.each(['skeleton', 'experiment'] as const)(
    'Markdown-it 15 raw subscript tokens (%s)',
    (pipeline) => {
        it.each([
            ['~a\\ b~', 'a\\ b'],
            ['~a\\\\b~', 'a\\\\b'],
            ['~**two**~', '**two**'],
            ['~два😀~', 'два😀'],
        ])('preserves exact source body for %s', (source, content) => {
            const md = new MarkdownIt();
            if (pipeline === 'skeleton') {
                md.use(skeletonPlugins().subscript, {path: '', notesAutotitle: false});
            } else {
                md.use(experimentPlugins().subscript);
            }
            const children = md.parseInline(`Prefix 😀 ${source} suffix`, {})[0].children || [];
            const start = children.findIndex((token) => token.type === 'sub_open');
            expect(children[start].markup).toBe('~');
            expect(children[start + 1].type).toBe('text');
            expect(children[start + 1].content).toBe(content);
            expect(children[start + 2].type).toBe('sub_close');
            expect(children[start + 2].markup).toBe('~');
        });

        it('leaves escapes outside successful subscript unchanged', () => {
            const md = new MarkdownIt().use(experimentPlugins().subscript);
            expect(md.renderInline('\\*outside\\* H~two~O \\~literal~')).toBe(
                '*outside* H<sub>two</sub>O ~literal~',
            );
        });
    },
);
