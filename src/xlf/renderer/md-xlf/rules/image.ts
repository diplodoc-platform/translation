import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';
import {XLFRendererState} from 'src/xlf/renderer/md-xlf/state';

import {generateOpenG, generateCloseG, generateX} from 'src/xlf/generator';

const image = {
    image_open: imageOpen,
    image_close: imageClose,
};

function imageOpen(this: CustomRenderer<XLFRendererState>) {
    return generateOpenG({ctype: 'image_text_part', equivText: '![]'});
}

function imageClose(this: CustomRenderer<XLFRendererState>, tokens: Token[], i: number) {
    const token = tokens[i];
    let rendered = '';

    rendered += generateCloseG();

    rendered += generateOpenG({ctype: 'image_attributes_part', equivText: '()'});

    const src = token.attrGet('src');
    if (src?.length) {
        rendered += generateX({ctype: 'image_attributes_src', equivText: src});
    }

    const title = token.attrGet('title');
    if (title?.length) {
        rendered += generateOpenG({ctype: 'image_attributes_title', equivText: '""'});

        rendered += title;

        rendered += generateCloseG();
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

    rendered += generateCloseG();

    return rendered;
}

export {image};
export default {image};
