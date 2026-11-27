import type {ChildNode} from 'domhandler';

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {load} from 'cheerio';
import {isTag, isText} from 'domhandler';
import MarkdownIt from 'markdown-it';
import footnotes from '@diplodoc/transform/plugins/footnotes';
import taskList from '@diplodoc/transform/plugins/task-list';
import {expect, it} from 'vitest';

import {compose, extract} from 'src/api';

import {sourceSyntax} from './source-syntax';

const evidence = process.env.TRANSLATION_SYNTAX_REPORT_DIR;
function saveReport(name: string, value: unknown): void {
    if (evidence) {
        mkdirSync(evidence, {recursive: true});
        writeFileSync(join(evidence, name), JSON.stringify(value, null, 2));
    }
}
const cases = {
    forward: 'Main[^a] text.\n\n[^a]: Definition text.\n',
    backward: '[^a]: Definition text.\n\nMain[^a] text.\n',
    unused: '[^unused]: Unused text.\n\nMain text.\n',
    duplicate: '[^a]: First text.\n\nMain[^a] text.\n\n[^a]: Second text.\n',
    missing: 'Main[^missing] text.\n',
    missingTranslatedLabel: 'Main[^text] text.\n',
    knownTranslatedLabel: 'Main[^text] text.\n\n[^text]: Definition text.\n',
    cutPlain: '{% cut "Title text" %}\n\nBody text.\n\n{% endcut %}\n',
    transitive: 'Main[^a] text.\n\n[^a]: First[^b] text.\n\n[^b]: Second text.\n',
    repeated: 'Main[^a] and[^a] text.\n\n[^a]: Definition text.\n',
    multiline: 'Main[^a] text.\n\n[^a]: First text.\n\n    Second **strong** text.\n',
    noteTitle:
        '{% note info "Title[^a] text" %}\n\nBody text.\n\n{% endnote %}\n\n[^a]: Definition text.\n',
    cutTitle:
        '{% cut "Title[^a] text" %}\n\nBody text.\n\n{% endcut %}\n\n[^a]: Definition text.\n',
    noteLocal:
        '{% note info "Title" %}\n\nBody[^a] text.\n\n[^a]: Definition text.\n\n{% endnote %}\n',
    quoteLocal: '> Main[^a] text.\n>\n> [^a]: Definition text.\n\nOutside[^a] text.\n',
    task: '- [x] Task text.\n- [ ] Other text.\n- [X] Third text.\n',
    nestedTask: '- [x] Task text.\n  - [ ] Nested text.\n',
    looseTask: '1. [x] Task text.\n\n2. [ ] Other text.\n',
    nbspTask: '- [\u00a0]\u00a0Task text.\n',
    noteTask: 'Main[^a] text.\n\n[^a]: - [x] Task[^b] text.\n\n[^b]: Definition text.\n',
    taskRef: '- [x] Task[^a] text.\n\n[^a]: Definition text.\n',
    escapeCode:
        '\\[^a] and `[^a]` text.\n\n[^a]: Definition text.\n\n- \\[x] Task text.\n- `[x]` Other text.\n',
    inlineCaret: 'Main ^[inline text] text.\n',
    malformedTask: '- [ ]\n- [y] Task text.\n- [x]no-space text.\n',
};
function targetXml(xml: string) {
    const $ = load(xml, {xml: {decodeEntities: false}});
    const attributes = (node: ChildNode): unknown[] =>
        isTag(node) ? [node.attribs, ...node.children.flatMap(attributes)] : [];
    const originals = $('source')
        .map((_, node) => $.xml(node))
        .get();
    $('source').each((_, source) => {
        const target = $(source).clone();
        const root = target.get(0);
        if (!root || !isTag(root)) {
            throw new Error('Expected source XML element');
        }
        root.name = 'target';
        function visit(node: ChildNode) {
            if (isText(node)) {
                node.data = node.data.replaceAll('text', 'translated longer prose');
            } else if (isTag(node)) {
                node.children.forEach(visit);
            }
        }
        root.children.forEach(visit);
        expect(attributes(root)).toEqual(attributes(source));
        $(source).after(target);
    });
    expect(
        $('source')
            .map((_, node) => $.xml(node))
            .get(),
    ).toEqual(originals);
    return $.xml();
}
it('records both actual round-trip pipelines without concealing unsupported cases', () => {
    const results = [];
    for (const experimental of [false, true]) {
        for (const compact of [false, true]) {
            for (const [name, source] of Object.entries(cases)) {
                const common = {
                    source: {language: 'en' as const, locale: 'US' as const},
                    target: {language: 'ru' as const, locale: 'RU' as const},
                    originalFile: 'syntax.md',
                    skeletonFile: 'syntax.skl',
                    compact,
                };
                try {
                    let xml: string, skeleton: string, roundTrip: string, translated: string;
                    if (experimental) {
                        const result = extract(source, {...common, useExperimentalParser: true});
                        xml = result.xliff.toString();
                        skeleton = result.skeleton;
                        roundTrip = compose(skeleton, xml, {
                            useExperimentalParser: true,
                            useSource: true,
                        }).document;
                        translated = compose(skeleton, targetXml(xml), {
                            useExperimentalParser: true,
                        }).document;
                    } else {
                        const result = extract(source, common);
                        xml = result.xliff;
                        skeleton = result.skeleton;
                        roundTrip = compose(skeleton, xml, {useSource: true});
                        translated = compose(skeleton, targetXml(xml), {useSource: false});
                    }
                    results.push({
                        name,
                        experimental,
                        compact,
                        source,
                        xml,
                        skeleton,
                        roundTrip,
                        translated,
                        sourceEqual: source === roundTrip,
                        targetEqual:
                            translated ===
                            (name === 'missingTranslatedLabel'
                                ? source.replaceAll('text', 'translated longer prose')
                                : source.replaceAll(' text', ' translated longer prose')),
                    });
                } catch (error) {
                    results.push({name, experimental, compact, source, error: String(error)});
                }
            }
        }
    }
    saveReport('roundtrips.json', results);
    const failures = results.filter(
        (r) => !('sourceEqual' in r) || !r.sourceEqual || !r.targetEqual,
    );
    expect(failures).toEqual([]);
    // Frozen control from unchanged Translation 6a0becf with the canonical installed grammar.
    const baseline = JSON.parse(
        readFileSync(join(__dirname, '__fixtures__', 'source-syntax-missing.json'), 'utf8'),
    );
    for (const result of results.filter((r) => r.name === 'missingTranslatedLabel')) {
        const prior = baseline.find(
            (r: {experimental: boolean; compact: boolean}) =>
                r.experimental === result.experimental && r.compact === result.compact,
        );
        if (!('xml' in result)) {
            throw new Error('Missing literal should extract normally');
        }
        expect({
            xml: result.xml,
            skeleton: result.skeleton,
            roundTrip: result.roundTrip,
            translated: result.translated,
        }).toEqual(prior.output);
    }
    for (const result of results) {
        if ('xml' in result) {
            expect(result.xml).not.toMatch(/(?:fnref|class="footnote|<sup|<input)/);
        }
    }
});
it('preserves same-env descriptors and source-local reference isolation', () => {
    const md = new MarkdownIt().use(sourceSyntax);
    const env = Object.defineProperty({}, 'footnotes', {
        configurable: true,
        get() {
            throw new Error('caller getter');
        },
    });
    const descriptors = Object.getOwnPropertyDescriptors(env);
    const first = md.parse(cases.forward, env);
    const second = md.parse('Main[^a] text.', env);
    const again = md.parse(cases.forward, env);
    expect(first).toEqual(again);
    expect(
        second
            .flatMap((token) => token.children ?? [])
            .some((token) => token.type === 'footnote_ref'),
    ).toBe(false);
    expect(Object.getOwnPropertyDescriptors(env)).toEqual(descriptors);
});

it('uses the canonical parser without extra parse passes and preserves failure frames', () => {
    const results = [];
    for (const input of [
        cases.forward,
        cases.unused,
        cases.duplicate,
        cases.noteTask,
        cases.task,
    ]) {
        const measure = (project: boolean) => {
            const md = new MarkdownIt();
            if (project) {
                md.use(sourceSyntax);
            } else {
                md.use(footnotes).use(taskList);
            }
            const inline = md.inline.parse;
            let calls = 0;
            md.inline.parse = function (...args) {
                calls++;
                return inline.apply(this, args);
            };
            const tokens = md.parse(input, {});
            return {calls, tokens};
        };
        const canonical = measure(false);
        const source = measure(true);
        expect(source.calls).toBe(canonical.calls);
        expect(
            source.tokens.some((token) =>
                ['footnote_block_open', 'footnote_open', 'footnote_anchor'].includes(token.type),
            ),
        ).toBe(false);
        results.push({
            input,
            canonicalInlineCalls: canonical.calls,
            sourceInlineCalls: source.calls,
        });
    }
    const md = new MarkdownIt().use(sourceSyntax);
    const env = Object.defineProperty({}, 'footnotes', {
        value: {custom: 'preserved'},
        configurable: true,
    });
    const descriptors = Object.getOwnPropertyDescriptors(env);
    let nested = false;
    md.inline.ruler.before('text', 'throw_or_nested', (state) => {
        if (state.src.startsWith('@failure', state.pos)) {
            throw new Error('injected failure');
        }
        if (state.src.startsWith('@nested', state.pos)) {
            const child = md.parse('Child[^a]\n\n[^a]: Child definition.', env);
            expect(
                child
                    .flatMap((token) => token.children ?? [])
                    .some((token) => token.type === 'footnote_ref'),
            ).toBe(true);
            expect(child.some((token) => token.content === 'Child definition.')).toBe(true);
            expect(() => md.parse('Body @failure', env)).toThrow('injected failure');
            nested = true;
            state.pos += 7;
            return true;
        }
        return false;
    });
    const first = md.parse('@nested Main[^a]\n\n[^a]: Definition.', env);
    expect(nested).toBe(true);
    expect(
        first
            .flatMap((token) => token.children ?? [])
            .some((token) => token.type === 'footnote_ref'),
    ).toBe(true);
    expect(Object.getOwnPropertyDescriptors(env)).toEqual(descriptors);
    expect(() => md.parse('@failure', env)).toThrow('injected failure');
    expect(Object.getOwnPropertyDescriptors(env)).toEqual(descriptors);
    expect(md.parse(cases.forward, env)).toEqual(md.parse(cases.forward, env));
    saveReport('parse-counters.json', {
        results,
        nestedFailureRestores: true,
        nestedSameLabelSuccessRestores: true,
        rootFailureRestores: true,
        htmlGeneration: 'throwing callback never reached',
    });
});
it('keeps public extraction A/B/A stable in both pipelines', () => {
    const common = {
        source: {language: 'en' as const, locale: 'US' as const},
        target: {language: 'ru' as const, locale: 'RU' as const},
        originalFile: 'syntax.md',
        compact: true,
    };
    for (const experimental of [false, true]) {
        const run = (input: string) => {
            const result = experimental
                ? extract(input, {...common, useExperimentalParser: true})
                : extract(input, common);
            return {skeleton: result.skeleton, xml: result.xliff.toString()};
        };
        const first = run(cases.noteTask);
        run(cases.duplicate);
        expect(run(cases.noteTask)).toEqual(first);
    }
});

it('preserves the exact renderer rule table and descriptors without invoking getters', () => {
    const md = new MarkdownIt();
    let gets = 0;
    const rules = md.renderer.rules;
    const original = () => 'caller ref';
    Object.defineProperty(rules, 'custom_renderer', {
        configurable: true,
        enumerable: true,
        get() {
            gets++;
            throw new Error('caller renderer getter');
        },
    });
    Object.defineProperty(rules, 'footnote_ref', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: original,
    });
    const symbol = Symbol('caller rule metadata');
    Object.defineProperty(rules, symbol, {value: new Date(0), enumerable: false});
    Object.freeze(rules);
    Object.defineProperty(md.renderer, 'rules', {
        value: rules,
        configurable: true,
        enumerable: false,
        writable: false,
    });
    const outer = Object.getOwnPropertyDescriptor(md.renderer, 'rules');
    const descriptors = Object.getOwnPropertyDescriptors(rules);
    md.use(sourceSyntax);
    expect(gets).toBe(0);
    expect(md.renderer.rules).toBe(rules);
    expect(Object.getOwnPropertyDescriptor(md.renderer, 'rules')).toEqual(outer);
    expect(Object.getOwnPropertyDescriptors(rules)).toEqual(descriptors);
    expect(md.renderer.rules.footnote_ref).toBe(original);
    expect(md.parse(cases.forward, {})).toBeDefined();
    expect(gets).toBe(0);
});

it('restores rule descriptors when canonical registration fails', () => {
    const md = new MarkdownIt();
    const rules = md.renderer.rules;
    const descriptors = Object.getOwnPropertyDescriptors(rules);
    const after = md.inline.ruler.after;
    md.inline.ruler.after = function (anchor, name, rule, options) {
        if (name === 'footnote_ref') {
            throw new Error('injected registration failure');
        }
        return after.call(this, anchor, name, rule, options);
    };
    expect(() => md.use(sourceSyntax)).toThrow('injected registration failure');
    expect(md.renderer.rules).toBe(rules);
    expect(Object.getOwnPropertyDescriptors(rules)).toEqual(descriptors);
});

it('isolates foreign env inline calls while retaining same-env late references', () => {
    const md = new MarkdownIt().use(sourceSyntax);
    let gets = 0;
    let sets = 0;
    const foreign = Object.defineProperty({}, 'footnotes', {
        configurable: true,
        get() {
            gets++;
            throw new Error('foreign env getter');
        },
        set() {
            sets++;
            throw new Error('foreign env setter');
        },
    });
    const stale = {footnotes: {refs: {':leak': 0}, list: [{label: 'leak', count: 0}]}};
    const descriptor = Object.getOwnPropertyDescriptor(foreign, 'footnotes');
    const refs = (tokens: ReturnType<MarkdownIt.MarkdownIt['parse']>) =>
        tokens
            .flatMap((token) => token.children ?? [])
            .filter((token) => token.type === 'footnote_ref').length;
    md.inline.ruler.before('text', 'foreign_failure', (state) => {
        if (state.src.startsWith('@fail', state.pos)) {
            throw new Error('foreign inline failure');
        }
        return false;
    });
    let calls = 0;
    md.core.ruler.after('inline', 'foreign_inline_probe', (state) => {
        if (state.inlineMode) {
            return;
        }
        calls++;
        expect(refs(md.parseInline('child[^a]', foreign))).toBe(0);
        expect(refs(md.parseInline('child[^leak]', stale))).toBe(0);
        expect(() => md.parseInline('child @fail', foreign)).toThrow('foreign inline failure');
        expect(refs(md.parseInline('late[^a]', state.env))).toBe(1);
        expect(Object.getOwnPropertyDescriptor(foreign, 'footnotes')).toEqual(descriptor);
    });
    md.parse(cases.forward, {});
    expect(calls).toBe(1);
    expect(gets).toBe(0);
    expect(sets).toBe(0);
    expect(stale.footnotes.list[0].count).toBe(0);
    expect(refs(md.parseInline('outside[^leak]', stale))).toBe(0);
    expect(Object.getOwnPropertyDescriptor(foreign, 'footnotes')).toEqual(descriptor);
});

it('preserves inherited and getter-only HTML render descriptors without reading them', () => {
    for (const accessor of [false, true]) {
        const md = new MarkdownIt();
        let gets = 0;
        if (accessor) {
            Object.defineProperty(md.renderer, 'render', {
                configurable: true,
                enumerable: false,
                get() {
                    gets++;
                    throw new Error('unused HTML getter');
                },
            });
        }
        const descriptor = Object.getOwnPropertyDescriptor(md.renderer, 'render');
        const rules = md.renderer.rules;
        md.use(sourceSyntax);
        expect(Object.getOwnPropertyDescriptor(md.renderer, 'render')).toEqual(descriptor);
        expect(md.renderer.rules).toBe(rules);
        expect(md.parse(cases.forward, {})).toBeDefined();
        expect(gets).toBe(0);
    }
});

it('restores parser and renderer descriptors after partial canonical installation fails', () => {
    for (const failAt of ['parseInline', 'taskList']) {
        const md = new MarkdownIt();
        let gets = 0;
        Object.defineProperty(md.renderer, 'render', {
            configurable: true,
            get() {
                gets++;
                throw new Error('unused HTML getter');
            },
        });
        Object.defineProperty(md, 'parse', {
            value: md.parse,
            configurable: true,
            writable: true,
            enumerable: false,
        });
        if (failAt === 'parseInline') {
            Object.defineProperty(md, 'parseInline', {
                value: md.parseInline,
                configurable: true,
                writable: false,
                enumerable: false,
            });
        } else {
            const after = md.core.ruler.after;
            md.core.ruler.after = function (anchor, name, rule, options) {
                if (name === 'yfm_task_list') {
                    throw new Error('task registration failure');
                }
                return after.call(this, anchor, name, rule, options);
            };
        }
        const before = [
            Object.getOwnPropertyDescriptor(md, 'parse'),
            Object.getOwnPropertyDescriptor(md, 'parseInline'),
            Object.getOwnPropertyDescriptor(md.renderer, 'render'),
            Object.getOwnPropertyDescriptor(md.renderer, 'rules'),
        ];
        const rules = md.renderer.rules;
        expect(() => md.use(sourceSyntax)).toThrow();
        expect([
            Object.getOwnPropertyDescriptor(md, 'parse'),
            Object.getOwnPropertyDescriptor(md, 'parseInline'),
            Object.getOwnPropertyDescriptor(md.renderer, 'render'),
            Object.getOwnPropertyDescriptor(md.renderer, 'rules'),
        ]).toEqual(before);
        expect(md.renderer.rules).toBe(rules);
        expect(gets).toBe(0);
    }
});
