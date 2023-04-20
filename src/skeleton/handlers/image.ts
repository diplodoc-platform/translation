import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';

import {SkeletonHandlersState} from './index';

function imageClose(this: MarkdownRenderer<SkeletonHandlersState>) {
    const token = this.state.image.pending.pop();
    if (token?.type !== 'image') {
        throw new Error('failed to replace image content with hashes');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        return '';
    }

    const {skeleton} = this.state;

    token.attrSet('title', `%%%${skeleton.id}%%%`);

    this.state.image.pending.push(token);

    this.state.skeleton.id++;

    return '';
}

export {imageClose};
export default {imageClose};
