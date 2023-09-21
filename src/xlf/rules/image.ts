import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Token from 'markdown-it/lib/token';
import {Options} from 'markdown-it';

import {segmenter} from 'src/xlf/segmenter';

import {XLFRendererState} from 'src/xlf/state';

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
    this: CustomRenderer<XLFRendererState>,
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

function imageClose(this: CustomRenderer<XLFRendererState>) {
    const token = this.state.image.pending.pop();
    if (token?.type !== 'image') {
        throw new Error('failed to render trans-unit from image');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        this.state.image.pending.push(token);
        return '';
    }

    let rendered = '';

    rendered += segmenter(title, this.state);

    return rendered;
}

export {image, imageClose, initState};
export default {image, imageClose, initState};
