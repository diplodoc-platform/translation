import {expect, it, vi} from 'vitest';
import MarkdownIt from 'markdown-it';
import {getLogger} from '@diplodoc/transform/lib/log';
import {createDeprecationReporter} from '@diplodoc/transform/deprecation';

import {skeletonPlugins} from './transform-plugins';

const source = [
    '{% cut "Outer" %}',
    '',
    '{% cut "Inner" %}',
    '',
    'Nested text.',
    '',
    '{% endcut %}',
    '',
    '{% endcut %}',
    '',
    ':::cut [Literal]',
    'Source directive syntax stays disabled.',
    ':::',
].join('\n');

it('uses the direct Cut callback on Markdown-it 15 without a legacy callback warning', () => {
    const warn = vi.fn();
    const log = getLogger({warn, error: () => {}, info: () => {}});
    const options = {
        output: undefined,
        path: 'translation.md',
        notesAutotitle: false,
        log,
        deprecations: createDeprecationReporter({log}),
    };
    const md = new MarkdownIt().use(skeletonPlugins().cut, options);
    const env: {meta?: {script?: string[]; style?: string[]}} = {};
    const html = md.render(source, env);

    expect(html.match(/<details class="yfm-cut"/g)).toHaveLength(2);
    expect(html).toContain('Nested text.');
    expect(html).toContain(':::cut [Literal]');
    expect(env.meta).toEqual({
        script: ['_assets/cut-extension.js', '_assets/cut-extension.js'],
        style: ['_assets/cut-extension.css', '_assets/cut-extension.css'],
    });
    expect(warn.mock.calls).toEqual([]);
});

it('retains the direct public collector with bundling disabled', () => {
    const plugin = skeletonPlugins().cut;

    expect(typeof plugin.collect).toBe('function');
    expect(plugin.collect(source, {destRoot: '.'})).toBeUndefined();
});
