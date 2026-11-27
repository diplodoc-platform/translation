import type {ChildNode} from 'domhandler';

import {load} from 'cheerio';
import {isTag, isText} from 'domhandler';
import MarkdownIt from 'markdown-it';
import {createNotesPlugin} from '@diplodoc/notes-extension/plugin';
import {describe, expect, it, vi} from 'vitest';

import {compose, extract} from 'src/api';

import {note} from './notes';
import {note as legacy} from './__fixtures__/legacy-notes';

describe('experimental notes canonical source adapter', () => {
    it('translates the title of a recognized note while retaining the original source marker', () => {
        const md = new MarkdownIt().use(note);
        const tokens = md.parse('{% note info "Title **strong**" %}\n\nBody\n\n{% endnote %}', {});
        const inline = tokens.find((token) => token.type === 'inline');
        const marker = inline?.children?.find((token) => token.type === 'note_open_tag');
        expect(marker?.content).toBe('{% note info "Title **strong**" %}');
        const previous = new MarkdownIt()
            .use(legacy)
            .parse('{% note info "Title **strong**" %}\n\nBody\n\n{% endnote %}', {});
        const oldMarker = previous
            .find((token) => token.type === 'inline')
            ?.children?.find((token) => token.type === 'note_open_tag');
        expect(marker?.children).toEqual(oldMarker?.children);
        expect(tokens.some((token) => token.type === 'yfm_note_open')).toBe(false);
    });
});

describe('same-environment nested parsing', () => {
    it.each([
        [false, false],
        [true, false],
        [false, true],
        [true, true],
    ])('restores outer frame when inner throws=%s and uses parseInline=%s', (throws, inline) => {
        const md = new MarkdownIt().use(note);
        const env = Object.defineProperty({}, 'custom', {value: 42, enumerable: false});
        const descriptors = Object.getOwnPropertyDescriptors(env);
        let captures = 0;
        let caught = 0;
        let beforeMaps: Array<number[] | null> = [];
        md.core.ruler.before('note_source_capture', 'capture_maps_before', (state) => {
            beforeMaps = state.tokens.map((token) => token.map?.slice() ?? null);
        });
        md.core.ruler.after('note_source_capture', 'capture_maps_after', (state) => {
            captures++;
            expect(state.tokens.map((token) => token.map)).toEqual(beforeMaps);
        });
        const inner = '{% note tip "Inner" %}\n\n@fail\n\n{% endnote %}';
        md.inline.ruler.before('backticks', 'nested_probe', (state) => {
            if (state.src.startsWith('@nested', state.pos)) {
                try {
                    const result = inline ? md.parseInline(inner, env) : md.parse(inner, env);
                    if (!inline) {
                        expect(
                            result
                                .flatMap((token) => token.children ?? [])
                                .find((token) => token.type === 'note_open_tag')
                                ?.children?.some((token) => token.content === 'Inner'),
                        ).toBe(true);
                    }
                } catch (error) {
                    if (!throws) {
                        throw error;
                    }
                    expect(error).toEqual(new Error('inner failure'));
                    caught++;
                }
                state.pos += '@nested'.length;
                return true;
            }
            if (throws && state.src.startsWith('@fail', state.pos)) {
                throw new Error('inner failure');
            }
            return false;
        });
        const outer = '{% note info "Outer" %}\n\n@nested\n\n{% endnote %}';
        const result = md.parse(outer, env);
        const marker = result
            .flatMap((token) => token.children ?? [])
            .find((token) => token.type === 'note_open_tag');
        expect(marker?.children?.some((token) => token.content === 'Outer')).toBe(true);
        expect(captures).toBe(2);
        expect(caught).toBe(throws ? 1 : 0);
        const again = md.parse('{% note warning "Again" %}\n\nbody\n\n{% endnote %}', env);
        expect(
            again
                .flatMap((token) => token.children ?? [])
                .find((token) => token.type === 'note_open_tag')
                ?.children?.some((token) => token.content === 'Again'),
        ).toBe(true);
        expect(captures).toBe(3);
        expect(Object.getOwnPropertyDescriptors(env)).toEqual(descriptors);
        if (throws) {
            expect(() => md.parse(inner, env)).toThrow('inner failure');
            const recovered = md.parse('{% note info "Recovered" %}\n\nbody\n\n{% endnote %}', env);
            expect(
                recovered
                    .flatMap((token) => token.children ?? [])
                    .find((token) => token.type === 'note_open_tag')
                    ?.children?.some((token) => token.content === 'Recovered'),
            ).toBe(true);
        }
        expect(Object.getOwnPropertySymbols(env)).toEqual([]);
    });
});

const options = {
    source: {language: 'en' as const, locale: 'US' as const},
    target: {language: 'ru' as const, locale: 'RU' as const},
    originalFile: 'notes.md',
    skeletonFile: 'notes.skl',
    compact: true,
    useExperimentalParser: true as const,
};

function translatedXml(xml: string, replacements: Record<string, string>): string {
    const $ = load(xml, {xml: {decodeEntities: false}});
    const original = $('source')
        .map((_, node) => $.xml(node))
        .get();
    $('source').each((_, source) => {
        const target = $(source).clone();
        const root = target.get(0);
        if (!root || !isTag(root)) {
            throw new Error('Expected source element');
        }
        root.name = 'target';
        function translate(node: ChildNode) {
            if (isText(node)) {
                for (const [from, to] of Object.entries(replacements)) {
                    node.data = node.data.replaceAll(from, to);
                }
            } else if (isTag(node)) {
                node.children.forEach(translate);
            }
        }
        root.children.forEach(translate);
        // Cloning preserves all protected attributes, including equiv-text.
        const attributes = (node: ChildNode): unknown[] =>
            isTag(node) ? [node.attribs, ...node.children.flatMap(attributes)] : [];
        expect(attributes(root)).toEqual(attributes(source));
        $(source).after(target);
    });
    expect(
        $('source')
            .map((_, node) => $.xml(node))
            .get(),
    ).toEqual(original);
    return $.xml();
}

describe('actual experimental notes round trip', () => {
    it.each([
        '{% note info "Title **strong**" %}\n\nBody text.\n\n{% endnote %}\n',
        '{% note info "" %}\n\nBody text.\n\n{% endnote %}\n',
        '{% note info "  spaced  " %}\n\nBody text.\n\n{% endnote %}\n',
        '{% note info    "Заголовок"   %}\n\nBody text.\n\n{% endnote %}\n',
        '{% note warning %}\n\nBody text.\n\n{% endnote %}\n',
        '{% note info "Title" %}\n\n{% note tip "Nested" %}\n\nBody text.\n\n{% endnote %}\n\n{% endnote %}\n',
        '`{% note info "Title" %}`\n\nBody text.\n',
        '{% note invalid "Title" %}\n\nBody text.\n\n{% endnote %}\n',
        '{% note info "Title" %}\n\nBody text.\n',
        'Before {% note info "Title" %} after.\n',
        '{% note info "Title" %} {.attrs}\n\nBody text.\n\n{% endnote %}\n',
        '- {% note info "Title" %}\n\n  Body text.\n\n  {% endnote %}\n',
        '```\n{% note info "Title" %}\n```\n',
        '{% note info "First" %}\n\nA.\n\n{% endnote %}\n\n{% note alert "Second" %}\n\nB.\n\n{% endnote %}\n',
    ])('preserves source %j', (source) => {
        const result = extract(source, options);
        const xml = result.xliff.toString();
        const output = compose(result.skeleton, xml, {
            useExperimentalParser: true,
            useSource: true,
        });
        expect(output.document).toBe(source);
    });

    it.each([
        '{% note info "Title" %}\n\nBody\n\n{% endnote %}',
        '{% note info "" %}\n\nBody\n\n{% endnote %}',
        '{% note info "Title" %}\n\n{% note tip "Nested" %}\n\nBody\n\n{% endnote %}\n\n{% endnote %}',
        '`{% note info "Title" %}`',
    ])('does not add caller inline parses for %j', (source) => {
        function calls(plugin: typeof note) {
            const md = new MarkdownIt().use(plugin);
            const spy = vi.spyOn(md.inline, 'parse');
            md.parse(source, {});
            return spy.mock.calls.length;
        }
        expect(calls(note)).toBe(calls(legacy));
    });

    it('preserves existing CRLF normalization while translating both note fields', () => {
        const source = '{% note info "Title" %}\r\n\r\nBody text.\r\n\r\n{% endnote %}\r\n';
        const result = extract(source, options);
        const xml = result.xliff.toString();
        const output = compose(result.skeleton, xml, {
            useExperimentalParser: true,
            useSource: true,
        });
        expect(output.document).toBe(source.replaceAll('\r\n', '\n'));
    });

    it('translates both an authored title and body', () => {
        const source = '{% note info "Title" %}\n\nBody text.\n\n{% endnote %}\n';
        const result = extract(source, options);
        const xml = translatedXml(result.xliff.toString(), {
            Title: 'Заголовок',
            'Body text': 'Текст',
        });
        const output = compose(result.skeleton, xml, {
            useExperimentalParser: true,
            useSource: false,
        });
        expect(output.document).toBe('{% note info "Заголовок" %}\n\nТекст.\n\n{% endnote %}\n');
    });
});

describe('canonical edge titles through actual experimental translation', () => {
    const cases = [
        {header: '{% note info "A "quoted" Title" %}', title: 'A "quoted" Title'},
        {header: '{% note info "A \\"quoted\\" Title" %}', title: 'A \\"quoted\\" Title'},
        {header: '{% note info "A %} Title" %}', title: 'A %} Title'},
        {header: '{% note info "A {% endnote %} Title" %}', title: 'A {% endnote %} Title'},
        {header: '{% note info\n"Title" %}', title: 'Title'},
    ];
    it.each(cases)('uses canonical title for $header', ({header, title}) => {
        const source = `${header}\n\nBody text.\n\n{% endnote %}\n`;
        const actual = new MarkdownIt();
        const inlineParse = vi.spyOn(actual.inline, 'parse');
        actual.use(
            createNotesPlugin((path) => path),
            {notesAutotitle: false},
        );
        const tokens = actual.parse(source, {});
        expect(tokens.find((token) => token.type === 'yfm_note_open')).toBeDefined();
        const titleOpen = tokens.findIndex((token) => token.type === 'yfm_note_title_open');
        expect(tokens[titleOpen + 1]?.content).toBe(title);
        expect(inlineParse.mock.calls.filter(([input]) => input === title)).toHaveLength(1);
        const experiment = new MarkdownIt();
        const experimentalInline = vi.spyOn(experiment.inline, 'parse');
        experiment.use(note);
        experiment.parse(source, {});
        expect(experimentalInline.mock.calls.filter(([input]) => input === title)).toHaveLength(1);
        const extracted = extract(source, options);
        const xml = extracted.xliff.toString();
        expect(
            compose(extracted.skeleton, xml, {useExperimentalParser: true, useSource: true})
                .document,
        ).toBe(source);
        const targetXml = translatedXml(xml, {Title: 'Заголовок', 'Body text': 'Текст'});
        expect(
            compose(extracted.skeleton, targetXml, {
                useExperimentalParser: true,
                useSource: false,
            }).document,
        ).toBe(source.replace('Title', 'Заголовок').replace('Body text', 'Текст'));
    });
});

it('canonical header selection prefers the full title when another valid header is its prefix', () => {
    const source =
        '{% note info "A" %}\n\nFirst body.\n\n{% endnote %}\n\n{% note info "A" %} B Title" %}\n\nSecond body.\n\n{% endnote %}\n';
    const extracted = extract(source, options);
    const xml = extracted.xliff.toString();
    expect(
        compose(extracted.skeleton, xml, {useExperimentalParser: true, useSource: true}).document,
    ).toBe(source);
    const target = translatedXml(xml, {Title: 'Заголовок'});
    expect(
        compose(extracted.skeleton, target, {useExperimentalParser: true, useSource: false})
            .document,
    ).toBe(source.replace('Title', 'Заголовок'));
});

it('keeps an unclosed marker opaque even if its title contains a delimiter', () => {
    const source = '{% note info "A %} Title" %}\n\nBody text.\n';
    const result = extract(source, options);
    const xml = translatedXml(result.xliff.toString(), {'Body text': 'Текст'});
    const output = compose(result.skeleton, xml, {useExperimentalParser: true, useSource: false});
    expect(output.document).toBe('{% note info "A %} Title" %}\n\nТекст.\n');
});

it('keeps an unclosed softbreak header opaque without hiding the following body', () => {
    const source = '{% note info\n"Title" %}\n\nBody text.\n';
    const result = extract(source, options);
    const xml = translatedXml(result.xliff.toString(), {'Body text': 'Текст'});
    const output = compose(result.skeleton, xml, {useExperimentalParser: true, useSource: false});
    expect(output.document).toBe('{% note info\n"Title" %}\n\nТекст.\n');
});

it('does not swallow prose after an unsupported inline marker', () => {
    const source = 'Before {% note info "A %} Title" %} after text.\n';
    const result = extract(source, options);
    expect(result.xliff.toString()).toContain(
        'equiv-text="{% note info &quot;A %} Title&quot; %}"',
    );
    const xml = translatedXml(result.xliff.toString(), {'after text': 'после'});
    const output = compose(result.skeleton, xml, {useExperimentalParser: true, useSource: false});
    expect(output.document).toBe('Before {% note info "A %} Title" %} после.\n');
});

it('translates an authored note title and body in the legacy pipeline', () => {
    const source = '{% note info "Title" %}\n\nBody text.\n\n{% endnote %}\n';
    const result = extract(source, {source: options.source, target: options.target, compact: true});
    const xml = translatedXml(result.xliff.toString(), {Title: 'Заголовок', 'Body text': 'Текст'});
    const output = compose(result.skeleton, xml, {useSource: false});
    expect(output).toBe('{% note info "Заголовок" %}\n\nТекст.\n\n{% endnote %}\n');
});
