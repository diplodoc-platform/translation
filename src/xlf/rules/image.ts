import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import {Options} from 'markdown-it';
import Token from 'markdown-it/lib/token';

import {transUnit} from 'src/xlf/generator';
import {XLFRulesState} from './index';

export type ImageRuleState = {
    image: {
        pending: Array<Token>;
    };
};

function initState() {
    return {
        image: {
            pending: new Array<Token>(),
        },
    };
}

function image(
    this: CustomRenderer<XLFRulesState>,
    tokens: Token[],
    i: number,
    options: Options,
    env: unknown,
) {
    const img = tokens[i];

    this.state.image.pending.push(img);

    const close = new Token('image_close', '', 0);

    const children = img.children ?? [];

    return this.renderInline([...children, close], options, env);
}

// eslint-disable-next-line camelcase
function imageClose(this: CustomRenderer<XLFRulesState>) {
    const token = this.state.image.pending.pop();
    if (token?.type !== 'image') {
        throw new Error('failed to render trans-unit from image');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        return '';
    }

    const {xlf} = this.state;

    let rendered = '';

    rendered += transUnit.generate({source: title, id: xlf.id, indentation: xlf.indentation});

    rendered += '\n';

    this.state.xlf.id++;

    return rendered;
}

export {image, imageClose, initState};
export default {image, imageClose, initState};
