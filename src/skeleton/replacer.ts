import {sentenize} from '@diplodoc/sentenizer';

import {replaceAfter} from 'src/string';
import {tokenize, LiquidTokenType} from 'src/liquid';

import {SkeletonRendererState} from './renderer';

function replacer(content: string, state: SkeletonRendererState) {
    let result = '';

    for (const token of tokenize(content)) {
        if (token.type === LiquidTokenType.Liquid) {
            result += token.lexemme;
            continue;
        }

        let replaced = token.lexemme;
        let cursor = 0;

        for (const segment of sentenize(token.lexemme)) {
            const hash = `%%%${state.skeleton.id}%%%`;

            ({replaced, cursor} = replaceAfter(replaced, segment, hash, cursor));

            state.skeleton.id++;
        }

        result += replaced;
    }

    return result;
}

export {replacer};
export default {replacer};
