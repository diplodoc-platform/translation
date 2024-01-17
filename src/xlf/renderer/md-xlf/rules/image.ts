import MarkdownIt from 'markdown-it';
import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';
import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';

import {generateX} from 'src/xlf/generator';

const decodeURL = new MarkdownIt().utils.lib.mdurl.decode;

const image = {
    image_open: imageOpen,
    image_close: imageClose,
};

function imageOpen(this: CustomRenderer<XLFRendererState>) {
    return generateX({
        ctype: 'image_text_part_open',
        equivText: '![',
    });
}

function imageClose(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const token = tokens[i];
    let rendered = '';

    rendered += generateX({
        ctype: 'image_text_part_close',
        equivText: ']',
    });

    rendered += generateX({
        ctype: 'image_attributes_part_open',
        equivText: '(',
    });

    let src = token.attrGet('src');
    if (src?.length) {
        src = decodeURL(src);
        rendered += generateX({
            ctype: 'image_attributes_src',
            equivText: src,
        });
    }

    const title = token.attrGet('title');
    if (title?.length) {
        rendered += generateX({
            ctype: 'image_attributes_title_open',
            equivText: '"',
        });

        rendered += title;

        rendered += generateX({
            ctype: 'image_attributes_title_close',
            equivText: '"',
        });
    }

    const height = token.attrGet('height');
    const width = token.attrGet('width');
    if (width?.length || height?.length) {
        let equivText = '=';

        if (width?.length) {
            equivText += width;
        }

        equivText += 'x';

        if (height?.length) {
            equivText += height;
        }

        rendered += generateX({ctype: 'image_attributes_size', equivText});
    }

    rendered += generateX({
        ctype: 'image_attributes_part_close',
        equivText: ')',
    });

    return rendered;
}

export {image};
export default {image};
