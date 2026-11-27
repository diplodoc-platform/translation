import type {ExtractOptions} from 'src/api/md';

import {afterEach, describe, expect, it, vi} from 'vitest';

import {compose, extract} from 'src/api';
import {CustomRenderer, CustomRendererLifeCycle} from 'src/renderer';

const options: ExtractOptions = {
    compact: true,
    source: {language: 'en', locale: 'US'},
    target: {language: 'ru', locale: 'RU'},
};

const nested = `---
title: Front title.
nested:
  label: Nested text.
  values:
    - List text.
    - 42
    - true
    - null
---
Body text.
`;

afterEach(() => vi.restoreAllMocks());

describe('document environment metadata', () => {
    it('extracts nested strings and preserves mixed YAML values on composition', () => {
        const result = extract(nested, options);

        expect(result.units).toEqual([
            '<source xml:space="preserve">Front title.</source>',
            '<source xml:space="preserve">Nested text.</source>',
            '<source xml:space="preserve">List text.</source>',
            '<source xml:space="preserve">Body text.</source>',
        ]);
        expect(result.skeleton).toContain('    - 42\n    - true\n    - null');
        expect(compose(result.skeleton, result.units, {useSource: true})).toBe(nested);
    });

    it('translates authored resource keys without translating generated plugin metadata', () => {
        const source = `---
style: [Author stylesheet.]
script: [Author script.]
visibilityAudiences: [human]
nested:
  values: &values [42, true, null]
  repeated: *values
---
Sentence with {% file src="path/to/file" name="readme.md" %}.

:::visibility agent
Agent instructions.
:::
`;
        const hooks = vi.spyOn(CustomRenderer.prototype, 'runHooks');
        const result = extract(source, options);
        const units = result.units.join('\n');

        expect(units).toContain('Author stylesheet.');
        expect(units).toContain('Author script.');
        expect(units).toContain('>human<');
        expect(units).not.toContain('_assets/file-extension.css');
        expect(units).not.toContain('>agent<');
        expect(compose(result.skeleton, result.units, {useSource: true}).split('---')[1]).toBe(
            source.split('---')[1],
        );
        expect(
            hooks.mock.calls.some(([, {env}]) => {
                if (!env || typeof env !== 'object' || !('meta' in env)) {
                    return false;
                }

                expect(env.meta).toMatchObject({
                    style: ['Author stylesheet.', '_assets/file-extension.css'],
                    script: ['Author script.'],
                    visibilityAudiences: ['human', 'agent'],
                    nested: {values: [42, true, null], repeated: [42, true, null]},
                });

                return true;
            }),
        ).toBe(true);
    });

    it('does not extract generated resources when frontmatter is absent', () => {
        const source = `{% file src="path/to/file" name="readme.md" %}

:::visibility agent
Agent instructions.
:::
`;
        const result = extract(source, options);

        expect(result.units.join('\n')).not.toContain('_assets/file-extension.css');
        expect(result.units.join('\n')).not.toContain('>agent<');
        expect(result.units.join('\n')).toContain('Agent instructions.');
    });

    it('keeps a malformed document independent after a valid document', () => {
        const invalid = '---\nnested:\n  title: [unterminated\n---\nBody text.\n';
        const before = extract(invalid, options);
        extract(nested, options);
        const after = extract(invalid, options);

        expect(after).toEqual(before);
        expect(compose(after.skeleton, after.units, {useSource: true})).toBe(invalid);
    });

    it('roundtrips invalid YAML as ordinary Markdown', () => {
        const source = '---\nnested:\n  title: [unterminated\n---\nBody text.\n';
        const result = extract(source, options);

        expect(result.units.join('\n')).toContain('unterminated');
        expect(compose(result.skeleton, result.units, {useSource: true})).toBe(source);
    });

    it('keeps empty and absent metadata independent of an earlier invocation', () => {
        extract(nested, options);

        for (const source of ['Only body text.\n', '---\n---\nBody text.\n']) {
            const result = extract(source, options);

            expect(result.units).toHaveLength(1);
            expect(result.units.join('\n')).not.toContain('Front title');
            expect(compose(result.skeleton, result.units, {useSource: true})).toBe(source);
        }
    });

    it('passes one document environment through actual renderer hooks and renews it per call', () => {
        const hooks = vi.spyOn(CustomRenderer.prototype, 'runHooks');
        extract(nested, options);
        const calls = [...hooks.mock.calls];
        const owner = calls.findIndex(
            ([cycle, parameters]) =>
                cycle === CustomRendererLifeCycle.BeforeRender &&
                Boolean(
                    parameters.env &&
                    typeof parameters.env === 'object' &&
                    'meta' in parameters.env,
                ),
        );
        const env = calls[owner][1].env;
        const renderer = hooks.mock.contexts[owner];

        expect(env).toMatchObject({meta: {title: 'Front title.'}});
        expect(calls.length).toBeGreaterThan(1);
        for (const [index, [, parameters]] of calls.entries()) {
            if (hooks.mock.contexts[index] === renderer) {
                expect(parameters.env).toBe(env);
            }
        }

        hooks.mockClear();
        extract('Only body text.\n', options);
        const next = hooks.mock.calls.find(
            ([cycle, parameters]) =>
                cycle === CustomRendererLifeCycle.BeforeRender &&
                Boolean(
                    parameters.env &&
                    typeof parameters.env === 'object' &&
                    'meta' in parameters.env,
                ),
        )?.[1].env;

        expect(next).not.toBe(env);
        expect(next).toMatchObject({meta: {}});
    });
});
