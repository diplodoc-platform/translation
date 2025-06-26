import type {ConsumerOptions} from 'src/consumer';

import MarkdownIt from 'markdown-it';
// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';
// @ts-ignore
import sup from 'markdown-it-sup';
// @ts-expect-error
import deflist from 'markdown-it-deflist';
import notes from '@diplodoc/transform/lib/plugins/notes';
import cut from '@diplodoc/transform/lib/plugins/cut';
import checkbox from '@diplodoc/transform/lib/plugins/checkbox';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import file from '@diplodoc/transform/lib/plugins/file';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';

import {customRenderer} from 'src/renderer';
import {Hash, hash as _hash} from 'src/hash';
import {Consumer} from 'src/consumer';
import {Liquid} from 'src/skeleton/liquid';
import {noTranslate} from 'src/directives/no-translate';

import term from './plugins/term';
import includes from './plugins/includes';
import {hooks} from './hooks';
import {rules} from './rules';

export type SkeletonOptions = ConsumerOptions;

export function skeleton(markdown: string, options: SkeletonOptions = {}, hash: Hash = _hash()) {
    const md = new MarkdownIt({html: true});
    const state = new Consumer(markdown, options, hash);
    const diplodocOptions = {
        notesAutotitle: false,
        path: '',
    };

    md.disable('reference');
    md.disable('text_join');
    md.disable('entity');
    md.disable('code');

    md.normalizeLink = (a: string) => a;
    md.normalizeLinkText = (a: string) => a;

    // diplodoc plugins
    md.use(noTranslate(), diplodocOptions);
    md.use(meta, diplodocOptions);
    md.use(includes, diplodocOptions);
    md.use(notes, diplodocOptions);
    md.use(cut, diplodocOptions);
    md.use(sup, diplodocOptions);
    md.use(deflist, diplodocOptions);
    md.use(checkbox, diplodocOptions);
    md.use(monospace, diplodocOptions);
    md.use(imsize, diplodocOptions);
    md.use(file, diplodocOptions);
    md.use(video, diplodocOptions);
    md.use(table, diplodocOptions);
    md.use(term, diplodocOptions);

    md.use(customRenderer, {state, rules, hooks});

    // This is a very tricky step.
    // We register on consumer unescaped version of markdown,
    // and there we parse tokens on escaped version.
    // This allow to search original token content in consumer.
    // But in future this may cause a problems in other matching scenarios.
    md.render(Liquid.escape(markdown));

    return state.content;
}
