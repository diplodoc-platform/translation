import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import MarkdownIt from 'markdown-it';

import {traverse} from 'src/meta';
import {segmenter} from 'src/xlf/renderer/md-xlf/segmenter';

import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';

export type MetaParameters = {
    markdownit: MarkdownItWithMeta;
};

export type MarkdownItWithMeta = MarkdownIt & {
    meta: {};
};

function hook(parameters: MetaParameters) {
    return function (this: CustomRenderer<XLFRendererState>) {
        const meta = parameters.markdownit.meta ?? {};
        if (!Object.keys(meta).length) {
            return '';
        }

        let rendered = '';

        traverse(meta, (val: string) => {
            rendered += segmenter(val, this.state);
            return val;
        });

        return rendered;
    };
}

export {hook};
export default {hook};
