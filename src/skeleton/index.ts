import MarkdownIt from 'markdown-it';

// configure with diplodoc plugins
// @ts-ignore
import meta from 'markdown-it-meta';
// @ts-ignore
import sup from 'markdown-it-sup';
import notes from '@diplodoc/transform/lib/plugins/notes';
import cut from '@diplodoc/transform/lib/plugins/cut';
import checkbox from '@diplodoc/transform/lib/plugins/checkbox';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import file from '@diplodoc/transform/lib/plugins/file';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';
import includes from './plugins/includes';

import {customRenderer} from 'src/renderer';
import {Hash, hash as _hash} from 'src/hash';
import {Consumer} from 'src/consumer';

import {hooks} from './hooks';
import {rules} from './rules';

export function render(markdown: string, hash: Hash = _hash()) {
    const md = new MarkdownIt({html: true});
    const state = new Consumer(markdown, 0, hash);
    const diplodocOptions = {
        notesAutotitle: false,
        path: '',
    };

    md.disable('reference');
    md.disable('text_join');
    md.disable('entity');

    md.normalizeLink = (a: string) => a;
    md.normalizeLinkText = (a: string) => a;

    // diplodoc plugins
    md.use(meta, diplodocOptions);
    md.use(includes, diplodocOptions);
    md.use(notes, diplodocOptions);
    md.use(cut, diplodocOptions);
    md.use(sup, diplodocOptions);
    md.use(checkbox, diplodocOptions);
    md.use(monospace, diplodocOptions);
    md.use(imsize, diplodocOptions);
    md.use(file, diplodocOptions);
    md.use(video, diplodocOptions);
    md.use(table, diplodocOptions);

    md.use(customRenderer, {state, rules, hooks});

    md.render(markdown);

    return state.content;
}
