import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer';

import {SkeletonHandlersState} from './index';

function linkClose(this: MarkdownRenderer<SkeletonHandlersState>) {
    const token = this.state.link.pending.pop();
    if (token?.type !== 'link_open') {
        throw new Error('failed to replace link content with hashes');
    }

    const title = token.attrGet('title');
    if (!title?.length) {
        return '';
    }

    const {skeleton} = this.state;

    token.attrSet('title', `%%%${skeleton.id}%%%`);

    this.state.link.pending.push(token);

    this.state.skeleton.id++;

    return '';
}

export {linkClose};
export default {linkClose};
