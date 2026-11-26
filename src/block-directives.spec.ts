import type {ChildNode} from 'domhandler';

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {load} from 'cheerio';
import {isTag, isText} from 'domhandler';
import {describe, expect, it} from 'vitest';
import MarkdownIt from 'markdown-it';

import {compose, extract} from 'src/api';
import {sourceNoTranslate} from 'src/block-directives';

const inputs = {
    boldCut: ':::cut [**Title prose**]\n\nBody prose.\n\n:::\n',
    boldNote: ':::note [**Title prose**] {type=tip}\n\nBody prose.\n\n:::\n',
    mixed: '{% cut "Title prose" %}\n\nBody prose.\n\n{% endcut %}\n\n:::note [Title prose] {type=tip}\n\nBody prose.\n\n:::\n',
    titleSpan: ':::cut [cut Title prose] {id=prose}\n\nBody prose.\n\n:::\n',
    emptyTitle: ':::cut []\n\nBody prose.\n\n:::\n',
    protectedCode: '```text\n:::cut [Literal]\n```\n\n    :::note [Literal]\n\nBody prose.\n',
    repeated:
        ':::cut [Title prose]\n\nBody prose.\n\n:::\n\n:::cut [Title prose]\n\nBody prose.\n\n:::\n',
    crlf: ':::note [Title prose] {type=tip}\r\n\r\nBody prose.\r\n\r\n:::\r\n',
    cut: ':::cut [Title prose] {id=prose class=prose}\n\nBody prose.\n\n:::\n',
    nested: '::::cut [Title prose]\n\n:::note [Title prose] {type=tip}\n\nBody prose.\n\n:::\n\n::::\n',
    quote: '> :::cut [Title prose]\n>\n> Body prose.\n>\n> :::\n',
    list: '- :::cut [Title prose]\n\n  Body prose.\n\n  :::\n',
    escaped: ':::cut [Title prose \\] label]\n\nBody prose.\n\n:::\n',
    titleFootnote: ':::cut [Title prose[^a]]\n\n- [x] Body prose.\n\n:::\n\n[^a]: Body prose.\n',
    fencedClose: ':::cut [Title prose]\n\n```text\n:::\n```\n\nBody prose.\n\n:::\n',
    titleless: ':::note {type=warning}\n\nBody prose.\n\n:::\n',
    note: ':::note [Title prose] {type=info}\n\nBody prose.\n\n:::\n',
    ...Object.fromEntries(
        ['regular', 'radio', 'dropdown', 'accordion'].map((variant) => [
            variant,
            `:::tabs {variant=${variant} group=prose}\n\n- First prose\n\n  Body prose.\n\n- Second prose\n\n  Body prose.\n\n:::\n`,
        ]),
    ),
};

function translatedXml(xml: string) {
    const $ = load(xml, {xml: {decodeEntities: false}});
    $('source').each((_, source) => {
        const target = $(source).clone();
        const root = target.get(0);
        if (!root || !isTag(root)) {
            throw new Error('Expected XLIFF source element');
        }
        root.name = 'target';
        function visit(node: ChildNode) {
            if (isText(node)) {
                node.data = node.data.replaceAll('prose', 'translated longer prose');
            } else if (isTag(node)) {
                node.children.forEach(visit);
            }
        }
        root.children.forEach(visit);
        $(source).after(target);
    });
    return $.xml();
}

function roundTrip(source: string, experimental: boolean, compact: boolean) {
    const common = {
        source: {language: 'en' as const, locale: 'US' as const},
        target: {language: 'ru' as const, locale: 'RU' as const},
        originalFile: 'directives.md',
        skeletonFile: 'directives.skl',
        compact,
    };
    if (experimental) {
        const result = extract(source, {...common, useExperimentalParser: true});
        const xml = result.xliff.toString();
        return {
            xml,
            source: compose(result.skeleton, xml, {useExperimentalParser: true, useSource: true})
                .document,
            target: compose(result.skeleton, translatedXml(xml), {useExperimentalParser: true})
                .document,
        };
    }
    const result = extract(source, common);
    return {
        xml: result.xliff,
        source: compose(result.skeleton, result.xliff, {useSource: true}),
        target: compose(result.skeleton, translatedXml(result.xliff), {useSource: false}),
    };
}

for (const experimental of [false, true]) {
    for (const compact of [false, true]) {
        describe(`colon source projection experimental=${experimental} compact=${compact}`, () => {
            it.each([
                ':::cut [Opaque] {constructor=x}\n\nBody prose.\n\n:::\n',
                ':::cut [Opaque] {__proto__=x}\n\nBody prose.\n\n:::\n',
                ':::cut [Opaque] {unknown=prose}\n\nBody prose.\n\n:::\n',
                ':::note [Opaque] {type=invalid}\n\nBody prose.\n\n:::\n',
                ':::tabs {variant=invalid group=prose}\n\nBody prose.\n\n:::\n',
                ':::cut [Opaque] {id=one id=two class=one class=two}\n\nBody prose.\n\n:::\n',
                ':::cut [Opaque\n\nBody prose.\n\n:::\n',
                ':::cut [Opaque]\n\nBody prose.\n',
            ])('keeps refused or incomplete headers opaque: %s', (source) => {
                const result = roundTrip(source, experimental, compact);
                expect(result.source).toBe(source);
                expect(result.target).toBe(
                    source.replaceAll('Body prose', 'Body translated longer prose'),
                );
                expect(Object.hasOwn(Object.prototype, 'prose')).toBe(false);
            });

            it.each([
                '::::no-translate {constructor=x}\n\n:::cut [Secret prose]\n\nSecret body prose.\n\n:::\n\n::::\n\nBody prose.\n',
                'Body prose :no-translate[Secret prose] end.\n',
                ':no-translate[Secret prose] **Body prose**\n',
                ':no-translate[Secret prose]:no-translate[Secret prose] **Body prose**\n',
                ':no-translate[Secret prose] **Body prose** and [Title prose](target) :no-translate[Secret prose].\n',
                '::no-translate[Secret prose]\n\nBody prose.\n',
                ':::no-translate\n\nSecret prose.\n\n:::\n\n{% cut "Title prose" %}\n\nBody prose.\n\n{% endcut %}\n',
            ])('keeps no-translate content private: %s', (source) => {
                const result = roundTrip(source, experimental, compact);
                expect(result.source).toBe(source);
                expect(result.target).toBe(
                    source.replace(/(Title|Body) prose/g, '$1 translated longer prose'),
                );
                const $ = load(result.xml, {xml: true});
                $('source x, source g').remove();
                expect($('source').text()).not.toContain('Secret');
            });

            it.each(Object.entries(inputs))(
                'preserves %s syntax while translating prose',
                (name, source) => {
                    const result = roundTrip(source, experimental, compact);
                    // V2 already normalizes CRLF before source parsing.
                    const expected = experimental ? source.replaceAll('\r\n', '\n') : source;
                    expect(result.source).toBe(expected);
                    expect(result.target).toBe(
                        expected.replace(
                            /(Title|Body|First|Second) prose/g,
                            '$1 translated longer prose',
                        ),
                    );
                    const $ = load(result.xml, {xml: true});
                    $('source x, source g').remove();
                    const eligible = $('source').text();
                    const prose =
                        name === 'protectedCode'
                            ? eligible.replace(':::cut [Literal]', '')
                            : eligible;
                    expect(prose).not.toMatch(
                        /:::(?:cut|note|tabs)|variant=|group=|type=|class=|id=/,
                    );
                },
            );
        });
    }
}

describe('canonical no-translate source adapter', () => {
    it('keeps native inline nesting balanced after an opaque marker', () => {
        const md = new MarkdownIt().use(sourceNoTranslate);
        const tokens = md.parseInline(':no-translate[Private] **Body** after.', {});
        const children = tokens[0].children ?? [];
        expect(children.find((token) => token.type === 'strong_open')?.level).toBe(0);
        expect(children.at(-1)?.level).toBe(0);
    });

    it.each(['inherited', 'own', 'getter'] as const)(
        'restores %s registration descriptor',
        (shape) => {
            const md = new MarkdownIt();
            const ruler = md.inline.ruler;
            const original = ruler.push;
            if (shape === 'own') {
                Object.defineProperty(ruler, 'push', {
                    value: original,
                    configurable: true,
                    writable: false,
                });
            } else if (shape === 'getter') {
                Object.defineProperty(ruler, 'push', {get: () => original, configurable: true});
            }
            const descriptor = Object.getOwnPropertyDescriptor(ruler, 'push');
            md.use(sourceNoTranslate);
            expect(Object.getOwnPropertyDescriptor(ruler, 'push')).toEqual(descriptor);
            expect(ruler.push).toBe(original);
            const tokens = md.parseInline('Before :no-translate[Private] after.', {});
            expect(
                tokens[0].children?.find((token) => token.type === 'no_translate_marker')?.content,
            ).toBe(':no-translate[Private]');
        },
    );

    it('restores the original descriptor when canonical registration fails', () => {
        const md = new MarkdownIt();
        const failure = new Error('Registration failure');
        Object.defineProperty(md.inline.ruler, 'push', {
            value() {
                throw failure;
            },
            configurable: true,
        });
        const descriptor = Object.getOwnPropertyDescriptor(md.inline.ruler, 'push');
        expect(() => md.use(sourceNoTranslate)).toThrow(failure);
        expect(Object.getOwnPropertyDescriptor(md.inline.ruler, 'push')).toEqual(descriptor);
    });
});

// Frozen same-dependency-graph control from unchanged 700898d. Compact V2 already
// inserts formatter whitespace for element-only paragraphs; this task does not fix it.
const boldBaseline: {
    cases: {
        name: string;
        experimental: boolean;
        compact: boolean;
        source: string;
        opening: string;
        sourceResult: string;
        targetResult: string;
    }[];
} = JSON.parse(
    readFileSync(join(__dirname, '__fixtures__', 'block-directives-baseline.json'), 'utf8'),
);

it.each(boldBaseline.cases)(
    'retains baseline bold-only $name whitespace experimental=$experimental compact=$compact',
    ({source, opening, sourceResult, targetResult, experimental, compact}) => {
        const plain = roundTrip(source, experimental, compact);
        expect(plain.source).toBe(sourceResult);
        expect(plain.target).toBe(targetResult);
        if (experimental && compact) {
            expect(sourceResult).not.toBe(source);
        } else {
            expect(sourceResult).toBe(source);
        }

        const closing = '\n:::\n';
        const wrapped = roundTrip(opening + source + closing, experimental, compact);
        expect(wrapped.source).toBe(opening + sourceResult + closing);
        expect(wrapped.target).toBe(opening + targetResult + closing);
    },
);
