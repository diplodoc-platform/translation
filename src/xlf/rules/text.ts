import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';
import {transUnit} from 'src/xlf/generator';

import {XLFRulesState} from './index';

function text(this: CustomRenderer<XLFRulesState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    const {xlf} = this.state;
    let rendererd = '';

    rendererd += transUnit.generate({source: content, id: xlf.id, indentation: xlf.indentation});

    rendererd += '\n';

    this.state.xlf.id++;

    return rendererd;
}

export {text};
export default {text};
