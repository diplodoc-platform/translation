import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import {sentenize} from '@diplodoc/sentenizer';
import Token from 'markdown-it/lib/token';

import {transUnit} from 'src/xlf/generator';
import {splitOnLiquid} from 'src/liquid';

import {XLFRulesState} from './index';

function text(this: CustomRenderer<XLFRulesState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    const {xlf} = this.state;

    let rendered = '';

    for (const chunk of splitOnLiquid(content)) {
        for (const segment of sentenize(chunk)) {
            rendered += transUnit.generate({
                source: segment,
                id: xlf.id,
                indentation: xlf.indentation,
            });

            rendered += '\n';

            this.state.xlf.id++;
        }
    }

    return rendered;
}

export {text};
export default {text};
