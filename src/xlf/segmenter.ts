import {sentenize} from '@diplodoc/sentenizer';

import {tokenize, LiquidTokenType} from 'src/liquid';
import {transUnit} from 'src/xlf/generator';
import {XLFRendererState} from './renderer';

function segmenter(content: string, state: XLFRendererState) {
    let rendered = '';

    for (const token of tokenize(content)) {
        if (token.type === LiquidTokenType.Liquid) {
            continue;
        }

        for (const segment of sentenize(token.lexemme)) {
            rendered += transUnit.generate({
                source: segment,
                id: state.xlf.id,
                indentation: state.xlf.indentation,
            });

            rendered += '\n';

            state.xlf.id++;
        }
    }

    return rendered;
}

export {segmenter};
export default {segmenter};
