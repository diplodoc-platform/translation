import {sentenize} from '@diplodoc/sentenizer';

import {generateTransUnit} from 'src/xlf/generator';
import {XLFRendererState} from './state';

function segmenter(content: string, state: XLFRendererState) {
    let rendered = '';

    for (const segment of sentenize(content)) {
        rendered += generateTransUnit({
            source: segment,
            id: state.xlf.id,
            indentation: state.xlf.indentation,
        });

        rendered += '\n';

        // eslint-disable-next-line no-param-reassign
        state.xlf.id++;
    }

    return rendered;
}

export {segmenter};
export default {segmenter};
