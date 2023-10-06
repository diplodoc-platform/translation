import {sentenize} from '@diplodoc/sentenizer';

import {transUnit} from 'src/xlf/generator';
import {XLFRendererState} from './state';

function segmenter(content: string, state: XLFRendererState) {
    let rendered = '';

    for (const segment of sentenize(content)) {
        rendered += transUnit.generate({
            source: segment,
            id: state.xlf.id,
            indentation: state.xlf.indentation,
        });

        rendered += '\n';

        state.xlf.id++;
    }

    return rendered;
}

export {segmenter};
export default {segmenter};
