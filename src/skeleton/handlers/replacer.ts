import {sentenize} from '@diplodoc/sentenizer';
import {replaceAfter} from 'src/string';

import {SkeletonHandlersState} from './index';

function replacer(content: string, state: SkeletonHandlersState) {
    const segments = sentenize(content);

    let replaced = content;
    let cursor = 0;

    for (const segment of segments) {
        const hash = `%%%${state.skeleton.id}%%%`;

        ({replaced, cursor} = replaceAfter(replaced, segment, hash, cursor));

        state.skeleton.id++;
    }

    return replaced;
}

export {replacer};
export default {replacer};
