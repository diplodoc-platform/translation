import type {SkeletonPluginOptions} from './transform-plugins';

import {afterEach, describe, expect, it, vi} from 'vitest';
import MarkdownIt from 'markdown-it';
import {log as legacyLog} from '@diplodoc/transform/log';
import notes from '@diplodoc/transform/lib/plugins/notes';
// Explicit legacy callback baseline for the Markdown-it 15 parity comparison below.
import cut from '@diplodoc/transform/lib/plugins/cut';
import checkbox from '@diplodoc/transform/lib/plugins/checkbox';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import file from '@diplodoc/transform/lib/plugins/file';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';
import deflist from '@diplodoc/transform/lib/plugins/deflist';
import {visibility} from '@diplodoc/transform/lib/plugins/visibility';
import underline from '@diplodoc/transform/plugins/underline';
import subscript from '@diplodoc/transform/plugins/subscript';

import {compose, extract} from 'src/api';

import {experimentPlugins, skeletonPlugins} from './transform-plugins';

const options: SkeletonPluginOptions = {path: '', notesAutotitle: false};

afterEach(() => {
    vi.doUnmock('@diplodoc/transform/lib/plugins/table');
    vi.doUnmock('@diplodoc/transform/plugins/subscript');
    vi.resetModules();
});

describe('finite Transform plugins on native Markdown-it 15', () => {
    const originals = {
        visibility: visibility({audience: 'preserve'}),
        notes,
        cut,
        checkbox,
        monospace,
        imsize,
        file,
        video,
        table,
        underline,
        subscript,
    };
    const cases = [
        {
            name: 'visibility',
            source: ':::visibility human\nHuman text.\n:::\n\n:::visibility agent\nAgent text.\n:::',
            html: 'Agent text.',
        },
        {name: 'notes', source: '{% note info %}\n\nNote text.\n\n{% endnote %}', html: 'yfm-note'},
        {name: 'cut', source: '{% cut "Title" %}\n\nCut text.\n\n{% endcut %}', html: 'yfm-cut'},
        {name: 'checkbox', source: '[X] Checked text.', html: 'type="checkbox"'},
        {name: 'monospace', source: '##Literal text##', html: '<samp>'},
        {name: 'imsize', source: '![Image text](image.png =20x30)', html: 'width="20"'},
        {
            name: 'file',
            source: '{% file src="file.pdf" name="Document" type="application/pdf" %}',
            html: 'file.pdf',
        },
        {name: 'video', source: '@[youtube](https://youtu.be/rJz4OaURJ6U)', html: '<iframe'},
        {name: 'table', source: '#|\n|| A | B ||\n|#', html: '<table>'},
        {name: 'underline', source: '++Underlined **bold** text++', html: '<u>'},
        {name: 'subscript', source: 'H~two~O', html: '<sub>'},
    ] as const;

    it.each(cases)(
        '$name preserves tokens, HTML and environment on the Markdown-it 15 parser',
        (item) => {
            const md = new MarkdownIt({html: true});
            const baseline = new MarkdownIt({html: true});
            const plugin: unknown = originals[item.name];
            if (typeof plugin !== 'function') {
                throw new TypeError('Expected callable fixture plugin');
            }
            plugin(baseline, options);
            const plugins = skeletonPlugins();
            if (item.name === 'cut') {
                md.use(plugins.cut);
            } else {
                md.use(plugins[item.name], options);
            }
            const env: Record<string, unknown> = {};
            const baselineEnv: Record<string, unknown> = {};
            // Checkbox ids use a document-specific random prefix.
            const random = vi.spyOn(Math, 'random');
            try {
                random.mockReturnValue(0.5);
                const tokens = md.parse(item.source, env);
                const baselineTokens = baseline.parse(item.source, baselineEnv);
                expect(tokens).toEqual(baselineTokens);
                const html = md.renderer.render(tokens, md.options, env);
                expect(html).toBe(
                    baseline.renderer.render(baselineTokens, baseline.options, baselineEnv),
                );
                expect(html).toContain(item.html);
                expect(env).toEqual(baselineEnv);
            } finally {
                random.mockRestore();
            }
        },
    );

    it('retains deflist with the experiment no-options call contract', () => {
        const md = new MarkdownIt().use(experimentPlugins().deflist);
        const baseline = new MarkdownIt();
        const plugin: unknown = deflist;
        if (typeof plugin !== 'function') {
            throw new TypeError('Expected callable definition-list fixture');
        }
        plugin(baseline);
        const source = 'Term\n: Definition';
        expect(md.render(source)).toBe(baseline.render(source));
        expect(md.render(source)).toContain('<dl>');
    });

    it('preserves actual experimental extraction, composition and literal code', () => {
        const source =
            'Term\n: Definition\n\n![Image](image.png =20x30)\n\n#|\n|| Cell A | Cell B ||\n|#\n\n`literal code`\n\n```js\nconst literal = 1;\n```\n';
        const result = extract(source, {
            compact: true,
            source: {language: 'en', locale: 'US'},
            target: {language: 'ru', locale: 'RU'},
            originalFile: 'fixture.md',
            skeletonFile: 'fixture.skl',
            useExperimentalParser: true,
        });
        const composed = compose(result.skeleton, result.xliff.toString(), {
            useExperimentalParser: true,
            useSource: true,
        });
        expect(composed.document).toBe(source);
        expect(result.xliff.toString()).toContain('Definition');
        expect(result.skeleton).toContain('const literal = 1;');
    });

    it('forwards parser/options identities, argument counts and errors unchanged', async () => {
        const failure = new Error('original plugin failure');
        const plugin = vi.fn(() => {
            throw failure;
        });
        vi.doMock('@diplodoc/transform/lib/plugins/table', () => ({default: plugin}));
        vi.resetModules();
        const loaded = await import('./transform-plugins.js');
        const md = new MarkdownIt();
        expect(() => md.use(loaded.skeletonPlugins().table, options)).toThrow(failure);
        expect(plugin.mock.calls).toEqual([[md, options]]);
        plugin.mockClear();
        expect(() => md.use(loaded.experimentPlugins().table)).toThrow(failure);
        expect(plugin.mock.calls).toEqual([[md]]);
    });

    it('restores native subscript registration after the original plugin fails', async () => {
        const failure = new Error('original subscript failure');
        const plugin = vi.fn(() => {
            throw failure;
        });
        vi.doMock('@diplodoc/transform/plugins/subscript', () => ({default: plugin}));
        vi.resetModules();
        const loaded = await import('./transform-plugins.js');
        const md = new MarkdownIt();
        const after = md.inline.ruler.after;
        const afterDescriptor = Object.getOwnPropertyDescriptor(md.inline.ruler, 'after');
        const hasOwnAfter = Object.hasOwn(md.inline.ruler, 'after');
        expect(() => md.use(loaded.skeletonPlugins().subscript, options)).toThrow(failure);
        expect(md.inline.ruler.after).toBe(after);
        expect(Object.hasOwn(md.inline.ruler, 'after')).toBe(hasOwnAfter);
        expect(Object.getOwnPropertyDescriptor(md.inline.ruler, 'after')).toEqual(afterDescriptor);
        expect(plugin.mock.calls).toEqual([[md, options]]);
        plugin.mockClear();
        expect(() => md.use(loaded.experimentPlugins().subscript)).toThrow(failure);
        expect(md.inline.ruler.after).toBe(after);
        expect(Object.hasOwn(md.inline.ruler, 'after')).toBe(hasOwnAfter);
        expect(Object.getOwnPropertyDescriptor(md.inline.ruler, 'after')).toEqual(afterDescriptor);
        expect(plugin.mock.calls).toEqual([[md]]);
    });

    it('preserves a pre-existing native sub rule while wrapping only the new rule', () => {
        const md = new MarkdownIt();
        const foreign = vi.fn(() => false);
        md.inline.ruler.after('emphasis', 'sub', foreign);
        const after = md.inline.ruler.after;
        const afterDescriptor = Object.getOwnPropertyDescriptor(md.inline.ruler, 'after');
        const hasOwnAfter = Object.hasOwn(md.inline.ruler, 'after');
        md.use(experimentPlugins().subscript);
        expect(md.inline.ruler.after).toBe(after);
        expect(Object.hasOwn(md.inline.ruler, 'after')).toBe(hasOwnAfter);
        expect(Object.getOwnPropertyDescriptor(md.inline.ruler, 'after')).toEqual(afterDescriptor);
        expect(md.inline.ruler.getRules('')).toContain(foreign);
        expect(md.renderInline('H~two~O')).toBe('H<sub>two</sub>O');
    });

    it('rejects a noncallable allowlisted export before registration', async () => {
        vi.doMock('@diplodoc/transform/lib/plugins/table', () => ({default: null}));
        vi.resetModules();
        const loaded = await import('./transform-plugins.js');
        expect(() => loaded.skeletonPlugins()).toThrow(
            'Expected a callable Translation Transform plugin',
        );
        expect(() => loaded.experimentPlugins()).toThrow(
            'Expected a callable Translation Transform plugin',
        );
    });
});

describe('deprecation diagnostics for source markup', () => {
    const options = {
        source: {language: 'en' as const, locale: 'US' as const},
        target: {language: 'ru' as const, locale: 'RU' as const},
        originalFile: 'article.md',
    };
    const markdown = '![Photo](img.png =100x50)';

    it.each(['skeleton', 'experiment', 'json'] as const)(
        'forwards legacy image usage only when enabled (%s)',
        (parser) => {
            const log = {deprecation: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn()};
            const run = (deprecationWarnings: boolean) => {
                const opts = {...options, log, deprecationWarnings};
                if (parser === 'experiment') {
                    return extract(markdown, {...opts, useExperimentalParser: true}).skeleton;
                }
                if (parser === 'json') {
                    const schema = {
                        $id: 'urn:example:article',
                        type: 'object',
                        properties: {body: {type: 'string', translate: 'md'}},
                    } as const;
                    return extract({body: markdown}, {...opts, schemas: [schema]}).skeleton;
                }
                return extract(markdown, opts).skeleton;
            };

            legacyLog.clear();
            const disabled = run(false);
            expect(legacyLog.get().warn).toEqual([]);
            expect(log.deprecation).not.toHaveBeenCalled();

            const enabled = run(true);
            expect(enabled).toEqual(disabled);
            expect(log.deprecation).toHaveBeenCalledTimes(1);
            expect(log.deprecation).toHaveBeenCalledWith(
                expect.stringContaining('IMAGE_SIZE_LEGACY_SYNTAX'),
            );
            expect(log.deprecation).toHaveBeenCalledWith(expect.stringContaining('article.md'));
            expect(log.warn).not.toHaveBeenCalled();
        },
    );
});
