import type {ExtractionDiagnostics} from 'src/transform-plugins';
import type {ConsumerOptions} from 'src/consumer';
import type {Hash} from 'src/hash';

import MarkdownIt from 'markdown-it';
// configure with diplodoc plugins
// @ts-ignore
import sup from 'markdown-it-sup';
// @ts-expect-error
import deflist from 'markdown-it-deflist';
import {createDocumentEnv} from '@diplodoc/transform/document';

import {customRenderer} from 'src/renderer';
import {hash as _hash} from 'src/hash';
import {Consumer} from 'src/consumer';
import {Liquid} from 'src/skeleton/liquid';
import {noTranslate} from 'src/directives/no-translate';
import {pluginDiagnostics, skeletonPlugins} from 'src/transform-plugins';
import {sourceSyntax} from 'src/source-syntax';
import {sourceBlockDirectives} from 'src/block-directives';
import {createTabItemSource} from 'src/tab-item-source';

import term from './plugins/term';
import includes from './plugins/includes';
import {pageConstructor} from './plugins/page-constructor';
import {hooks} from './hooks';
import {metaPlugin} from './hooks/meta';
import {rules} from './rules';

export type SkeletonOptions = ConsumerOptions & ExtractionDiagnostics;

/**
 * `warnings` receives problems that left a part of the content untranslated
 * without failing the extraction.
 * @param markdown Original Markdown source.
 * @param options Existing extraction and rendering options.
 * @param hash Placeholder hash generator for the document.
 * @param warnings Receives recoverable extraction warnings.
 * @returns Markdown skeleton with translatable content replaced by placeholders.
 */
export function skeleton(
    markdown: string,
    options: SkeletonOptions = {},
    hash: Hash = _hash(),
    warnings: string[] = [],
) {
    const md = new MarkdownIt({html: true});
    const state = new Consumer(markdown, options, hash);
    const diplodocOptions = {
        notesAutotitle: false,
        path: '',
    };
    const markupOptions = {...diplodocOptions, ...pluginDiagnostics(options)};
    const plugins = skeletonPlugins();
    const tabItems = createTabItemSource({pipeline: 'skeleton', warnings: state.warnings});

    md.disable('reference');
    md.disable('text_join');
    md.disable('entity');
    md.disable('code');

    md.normalizeLink = (a: string) => a;
    md.normalizeLinkText = (a: string) => a;

    // diplodoc plugins
    md.use(noTranslate());
    md.use(plugins.visibility, diplodocOptions);
    md.use(pageConstructor());
    md.use(metaPlugin);
    md.use(includes);
    md.use(plugins.notes, diplodocOptions);
    md.use(plugins.cut);
    md.use(sup, diplodocOptions);
    md.use(deflist, diplodocOptions);
    md.use(plugins.checkbox, diplodocOptions);
    md.use(plugins.monospace, diplodocOptions);
    md.use(plugins.imsize, markupOptions);
    md.use(plugins.file, diplodocOptions);
    md.use(plugins.video, diplodocOptions);
    md.use(plugins.table, markupOptions);
    md.use(term);
    md.use(plugins.underline, diplodocOptions);
    md.use(plugins.subscript, diplodocOptions);

    md.use(sourceBlockDirectives, {
        pipeline: 'skeleton',
        onTabsContainer: tabItems.acceptContainer,
    });
    md.use(sourceSyntax);
    md.use(tabItems.plugin);

    md.use(customRenderer, {state, rules, hooks});

    // This is a very tricky step.
    // We register on consumer unescaped version of markdown,
    // and there we parse tokens on escaped version.
    // This allow to search original token content in consumer.
    // But in future this may cause a problems in other matching scenarios.
    const env = createDocumentEnv();
    md.render(Liquid.escape(markdown), env);

    warnings.push(...state.warnings);

    return state.content;
}
