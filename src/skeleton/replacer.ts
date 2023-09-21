import {sentenize} from '@diplodoc/sentenizer';

import {replaceAfter} from 'src/string';
import {SkeletonRendererState} from './renderer';

function replacer(content: string, state: SkeletonRendererState) {
    let replaced = content;

    for (const segment of sentenize(content)) {
        const hash = `%%%${state.skeleton.id}%%%`;

        let cursor = 0;

        ({replaced, cursor} = replaceAfter(replaced, segment, hash, cursor));

        state.skeleton.id++;
    }

    return replaced;
}

export {replacer};
export default {replacer};
