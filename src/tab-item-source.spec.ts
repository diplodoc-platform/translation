import type {ChildNode} from 'domhandler';
import type {StateCore, Token} from 'markdown-it';

import {load} from 'cheerio';
import {isTag, isText} from 'domhandler';
import MarkdownIt from 'markdown-it';
import {describe, expect, it} from 'vitest';

import {compose, extract} from 'src/api';
import {sourceBlockDirectives} from 'src/block-directives';
import {noTranslate} from 'src/directives';
import {sourceSyntax} from 'src/source-syntax';
import {createTabItemSource} from 'src/tab-item-source';
import {skeletonPlugins} from 'src/transform-plugins';

const body =
    '- First label\n\n  Body prose.\n\n- Second label {selected} {#custom}\n\n  Other prose.\n';
const wrap = (value: string, variant = 'regular') =>
    `:::tabs {variant=${variant} group=keep}\n\n${value}\n:::\n`;
const fixtures = {
    ...Object.fromEntries(
        ['regular', 'radio', 'dropdown', 'accordion'].map((variant) => [
            variant,
            wrap(body, variant),
        ]),
    ),
    legacy: `{% list tabs %}\n\n${body}\n{% endlist %}\n`,
    bold: wrap(body.replace('Second label {selected}', '**Second label {selected}**')),
    emphasis: wrap(body.replace('Second label {selected}', '*Second label {selected}*')),
    markerFirst: wrap(body.replace('Second label {selected}', '**{selected} Second label**')),
    link: wrap(body.replace('Second label {selected}', '[Second label {selected}](target)')),
    nested: `::::cut [Outer]\n\n${wrap(body)}\n::::\n`,
    visibility: `::::visibility agent\n\n${wrap(body)}\n::::\n`,
    quote: wrap(body)
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n'),
    list:
        '- Outside\n\n' +
        wrap(body)
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n'),
    repeated: wrap(body.replaceAll(/First label|Second label/g, 'Same label')),
    multiline: wrap('- First label\n  continuation {selected} {#custom}\n\n  Body prose.\n'),
    nestedTabs: wrap(
        '- Parent label {selected}\n\n  :::tabs\n\n  - Nested label {selected} {#custom}\n\n    Body prose.\n\n  :::\n',
    ),
    anchorSelectedOverlap: wrap(
        body.replace('Second label {selected} {#custom}', 'Second label {#custom{selected}}'),
    ),
};

function translatedXml(xml: string) {
    const $ = load(xml, {xml: {decodeEntities: false}});
    $('source').each((_, source) => {
        const target = $(source).clone();
        const root = target.get(0);
        if (!root || !isTag(root)) {
            throw new Error('Expected an XLIFF source');
        }
        root.name = 'target';

        function visit(node: ChildNode) {
            if (isText(node)) {
                node.data = node.data
                    .replaceAll('label', 'translated longer label')
                    .replaceAll('selected', 'POISON_SELECTED')
                    .replaceAll('custom', 'POISON_CUSTOM');
            } else if (isTag(node) && node.name !== 'x') {
                node.children.forEach(visit);
            }
        }

        root.children.forEach(visit);
        $(source).after(target);
    });
    return $.xml();
}

function roundTrip(source: string, experimental: boolean, compact: boolean) {
    const options = {
        source: {language: 'en' as const, locale: 'US' as const},
        target: {language: 'ru' as const, locale: 'RU' as const},
        originalFile: 'tabs.md',
        skeletonFile: 'tabs.skl',
        compact,
    };

    if (experimental) {
        const result = extract(source, {...options, useExperimentalParser: true});
        const xml = result.xliff.toString();
        return {
            xml,
            warnings: result.warnings ?? [],
            source: compose(result.skeleton, xml, {useExperimentalParser: true, useSource: true})
                .document,
            target: compose(result.skeleton, translatedXml(xml), {useExperimentalParser: true})
                .document,
        };
    }

    const result = extract(source, options);
    return {
        xml: result.xliff,
        warnings: result.warnings ?? [],
        source: compose(result.skeleton, result.xliff, {useSource: true}),
        target: compose(result.skeleton, translatedXml(result.xliff), {useSource: false}),
    };
}

for (const experimental of [false, true]) {
    for (const compact of [false, true]) {
        describe(`Tabs source markers experimental=${experimental} compact=${compact}`, () => {
            it.each(Object.entries(fixtures))('translates only label prose in %s', (_, source) => {
                const result = roundTrip(source, experimental, compact);
                expect(result.source).toBe(source);
                expect(result.target).toBe(source.replaceAll('label', 'translated longer label'));
                expect(result.warnings).toEqual([]);

                const $ = load(result.xml, {xml: true});
                $('source x').remove();
                expect($('source').text()).not.toMatch(/selected|custom|variant=|group=/);
            });

            it.each([
                [
                    'discontinuous-display-marker',
                    '- Second label {sel{#id }ected} {selected}\n\n  Body prose.\n',
                ],
                [
                    'atomic-inline-marker',
                    '- Second label `{selected}` {#custom}\n\n  Body prose.\n',
                ],
                [
                    'atomic-inline-marker',
                    '- Second label :no-translate[{selected}] {#custom}\n\n  Body prose.\n',
                ],
            ])('warns and preserves the whole title for %s', (reason, value) => {
                const source = wrap(value);
                const result = roundTrip(source, experimental, compact);
                expect(result.source).toBe(source);
                expect(result.target).toBe(source);
                expect(result.warnings).toEqual([
                    `Tabs item source left untranslated (${reason}) at normalized input line 3.`,
                ]);
            });

            it('warns for a titleless item without exposing marker bytes', () => {
                const source =
                    wrap('-\n\n- Second label {selected}\n\n  Body label.\n') +
                    '\nOutside prose.\n';
                const result = roundTrip(source, experimental, compact);
                expect(result.source).toBe(source);
                expect(result.target).not.toContain('POISON_');
                expect(result.target).toBe(source);
                expect(result.warnings.some((warning) => warning.includes('missing-title'))).toBe(
                    true,
                );
            });

            it('protects only the first canonical selected marker', () => {
                const source = wrap(
                    body.replace('Second label {selected}', 'Second label {selected} {selected}'),
                );
                const result = roundTrip(source, experimental, compact);
                expect(result.source).toBe(source);
                expect(result.target).toContain('{selected} {POISON_SELECTED}');
            });

            it('retains ordinary list prose and does not claim marker ownership', () => {
                const result = roundTrip(body, experimental, compact);
                expect(result.source).toBe(body);
                expect(result.target).toContain('{POISON_SELECTED}');
                expect(result.warnings).toEqual([]);
            });

            it('ignores fenced and block no-translate Tabs examples', () => {
                const source = `~~~text translate=no\n${wrap(body)}~~~\n\n::::no-translate\n\n${wrap(body)}\n::::\n\nOutside label.\n`;
                const result = roundTrip(source, experimental, compact);
                expect(result.source).toBe(source);
                expect(result.target).toBe(
                    source.replace('Outside label', 'Outside translated longer label'),
                );
                expect(result.warnings).toEqual([]);
            });

            it('refuses partial observations after canonical generation fails', () => {
                const source = `{% list tabs %}\n\n- First {selected}\n\n- Second {selected}\n\n{% endlist %}\n`;
                expect(() => roundTrip(source, experimental, compact)).toThrow(
                    'Tabs item source extraction refused: canonical parsing failed',
                );
            });
        });
    }
}

it('keeps the ordinary experimental extraction output shape unchanged', () => {
    const result = extract('Ordinary label.\n', {
        useExperimentalParser: true,
        source: {language: 'en', locale: 'US'},
        target: {language: 'ru', locale: 'RU'},
        originalFile: 'a.md',
    });
    expect(Object.keys(result).sort()).toEqual(['skeleton', 'xliff']);
});

it('warns and makes ambiguous source titles opaque without changing body tokens', () => {
    const warnings: string[] = [];
    const projection = createTabItemSource({pipeline: 'experiment', warnings});
    const md = new MarkdownIt()
        .use(noTranslate())
        .use(sourceBlockDirectives, {
            pipeline: 'experiment',
            onTabsContainer: projection.acceptContainer,
        })
        .use(sourceSyntax)
        .use(projection.plugin);
    md.core.ruler.before('translation_tab_item_association', 'duplicate-source-title', (state) => {
        const original = state.tokens.find(
            (token) => token.type === 'inline' && token.content.startsWith('Second label'),
        );
        if (!original) {
            throw new Error('Expected a source title');
        }
        const duplicate = new state.Token('inline', '', 0);
        duplicate.content = original.content;
        duplicate.map = original.map;
        duplicate.children = [];
        state.tokens.push(duplicate);
    });

    const tokens = md.parse(wrap(body), {});
    const titles = tokens.filter((token) => token.content.startsWith('Second label'));
    expect(titles).toHaveLength(2);
    expect(
        titles.every((token) => token.children?.[0].type === 'translation_directive_marker'),
    ).toBe(true);
    expect(tokens.find((token) => token.content === 'Body prose.')?.children?.[0].type).toBe(
        'text',
    );
    expect(
        warnings.some(
            (warning) =>
                warning.includes('ambiguous-source-title') &&
                warning.includes('normalized input line 7'),
        ),
    ).toBe(true);
});

function sourceParser(projected: boolean) {
    const warnings: string[] = [];
    const projection = createTabItemSource({pipeline: 'experiment', warnings});
    const md = new MarkdownIt({html: true});
    const plugins = skeletonPlugins();
    const options = {notesAutotitle: false, path: '', enableInlineStyling: true};
    md.use(noTranslate()).use(plugins.video, options).use(plugins.imsize, options);
    md.use(sourceBlockDirectives, {
        pipeline: 'experiment',
        onTabsContainer: projection.acceptContainer,
    }).use(sourceSyntax);
    if (projected) {
        md.use(projection.plugin);
    }
    return md;
}

it.each([
    ['footnotes', 'First label[^a] {selected}', 'Body[^a].', '\n[^a]: Note.\n'],
    [
        'video',
        'First label @[vk](https://vk.com/video_ext.php?oid=1&id=2) {selected}',
        'Body prose.',
        '',
    ],
    ['image', 'First label ![alt](image.png =100x200) {selected}', 'Body prose.', ''],
    [
        'links and no-translate',
        'First [label](target) :no-translate[Private] {{variable}} {selected}',
        'Body prose.',
        '',
    ],
])('keeps %s inline effects identical to one native parse', (_, title, text, suffix) => {
    const source = wrap(`- ${title}\n\n  ${text}\n`) + suffix;
    const results = [false, true].map((projected) => {
        const md = sourceParser(projected);
        let snapshot = '';
        md.core.ruler.after('inline', 'capture-inline-effects', (state) => {
            snapshot = JSON.stringify({
                env: state.env,
                references: state.tokens
                    .flatMap((token) => token.children ?? [])
                    .filter((token) => token.type === 'footnote_ref')
                    .map((token) => token.meta),
            });
        });
        md.parse(source, {});
        return snapshot;
    });
    expect(results[1]).toBe(results[0]);
    if (title.includes('[^a]')) {
        expect(JSON.parse(results[1])).toMatchObject({
            env: {footnotes: {list: [{count: 2}]}},
            references: [
                {id: 0, subId: 0, label: 'a'},
                {id: 0, subId: 1, label: 'a'},
            ],
        });
    }
    if (title.includes('@[vk]')) {
        expect(JSON.parse(results[1])).toMatchObject({
            env: {meta: {csp: [{'frame-src': ['https://vk.com/', 'https://login.vk.com/']}]}},
        });
    }
    if (title.includes('![alt]')) {
        expect(JSON.parse(results[1])).toMatchObject({
            env: {additionalOptionsCssWhiteList: {'aspect-ratio': true}},
        });
    }
});

it('keeps projected inline context private across nested calls and parser reuse', () => {
    const md = new MarkdownIt();
    const native = md.inline.parse;
    const nested: Token[] = [];
    let inside = false;
    let titleCalls = 0;
    const original: typeof native = function (this: typeof md.inline, source, parser, env, output) {
        expect(this).toBe(md.inline);
        if (source === 'Second label {selected}') {
            titleCalls++;
            if (!inside) {
                inside = true;
                try {
                    md.inline.parse(source, parser, env, nested);
                } finally {
                    inside = false;
                }
            }
        }
        native.call(this, source, parser, env, output);
    };
    Object.defineProperty(md.inline, 'parse', {
        value: original,
        writable: false,
        enumerable: false,
        configurable: true,
    });
    const projection = createTabItemSource({pipeline: 'experiment', warnings: []});
    md.use(sourceBlockDirectives, {
        pipeline: 'experiment',
        onTabsContainer: projection.acceptContainer,
    })
        .use(sourceSyntax)
        .use(projection.plugin);
    const descriptor = Object.getOwnPropertyDescriptor(md.inline, 'parse');
    expect(descriptor).toMatchObject({writable: false, enumerable: false, configurable: true});
    const source = wrap('- Second label {selected}\n\n  Body prose.\n');
    md.parse(source, {});
    expect(titleCalls).toBe(2);
    expect(nested.some((token) => token.type === 'translation_directive_marker')).toBe(false);
    expect(
        md
            .parse('Second label {selected}\n', {})[1]
            .children?.some((token) => token.type === 'translation_directive_marker'),
    ).toBe(false);
    const again = md.parse(source, {});
    expect(
        again
            .flatMap((token) => token.children ?? [])
            .some((token) => token.type === 'translation_directive_marker'),
    ).toBe(true);
});

it('restores active inline context after an original lexer error', () => {
    const md = new MarkdownIt();
    const native = md.inline.parse;
    let fail = true;
    md.inline.parse = function (source, parser, env, output) {
        if (fail && source.includes('Second label')) {
            fail = false;
            throw new Error('Original inline failure');
        }
        native.call(this, source, parser, env, output);
    };
    const projection = createTabItemSource({pipeline: 'experiment', warnings: []});
    md.use(sourceBlockDirectives, {
        pipeline: 'experiment',
        onTabsContainer: projection.acceptContainer,
    })
        .use(sourceSyntax)
        .use(projection.plugin);
    expect(() => md.parse(wrap('- Second label {selected}\n\n  Body prose.\n'), {})).toThrow(
        'Original inline failure',
    );
    const ordinary = md.parseInline('Second label {selected}', {});
    expect(
        ordinary[0].children?.some((token) => token.type === 'translation_directive_marker'),
    ).toBe(false);
});

it.each(['missing', 'replaced'] as const)('refuses a %s native inline output identity', (kind) => {
    const md = sourceParser(true);
    const mutate = (state: StateCore) => {
        const title = state.tokens.find((token) => token.content === 'Second label {selected}');
        if (!title) {
            throw new Error('Expected a title');
        }
        title.children = kind === 'missing' ? null : [];
    };
    if (kind === 'missing') {
        md.core.ruler.before('translation_tab_item_association', 'missing-output', mutate);
    } else {
        md.core.ruler.after('translation_tab_item_association', 'replaced-output', mutate);
    }
    expect(() => md.parse(wrap('- Second label {selected}\n\n  Body prose.\n'), {})).toThrow(
        /Tabs item source extraction refused: inline output identity (?:is ambiguous|changed)/,
    );
});
