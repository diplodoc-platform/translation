import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';
import Token from 'markdown-it/lib/token';

import {SkeletonHandlersState} from './index';

function text(this: MarkdownRenderer<SkeletonHandlersState>, tokens: Token[], i: number) {
    const content = tokens[i].content;
    if (!content?.length) {
        return '';
    }

    const {skeleton} = this.state;

    tokens[i].content = `%%%${skeleton.id}%%%`;

    this.state.skeleton.id++;

    return '';
}

export {text};
export default {text};
