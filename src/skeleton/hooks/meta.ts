import MarkdownIt from 'markdown-it';
import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import {dump} from 'js-yaml';

import {traverse} from 'src/meta';
import {replacer} from 'src/skeleton/replacer';

export type MetaParameters = {
    markdownit: MarkdownItWithMeta;
};

export type MarkdownItWithMeta = MarkdownIt & {
    meta: {};
};

function hook(parameters: MetaParameters) {
    return function (this: MarkdownRenderer) {
        const meta = parameters.markdownit.meta ?? {};

        if (!Object.keys(meta).length) {
            return '';
        }

        traverse(meta, (val: string) => {
            return replacer(val, this.state);
        });

        let rendered = '';

        rendered += `---${this.EOL}`;

        rendered += dump(meta);

        rendered += `---${this.EOL}`;

        return rendered;
    };
}

export {hook};
export default {hook};
