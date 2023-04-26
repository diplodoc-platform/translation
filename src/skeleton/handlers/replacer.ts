import {sentenize} from '@diplodoc/sentenizer';

import {SkeletonHandlersState} from './index';

function replacer(content: string, state: SkeletonHandlersState) {
    const segments = sentenize(content);

    let replaced = content;
    let cursor = 0;

    for (const segment of segments) {
        const hash = `%%%${state.skeleton.id}%%%`;

        ({replaced, cursor} = replace(replaced, segment, hash, cursor));

        state.skeleton.id++;
    }

    return replaced;
}

function replace(source: string, replacee: string, replacement: string, after = 0) {
    let cursor = after;
    let replaced = source.slice(0, after);

    replaced += source.slice(after).replace(replacee, function (match, group, offset) {
        cursor = offset + match.length + 1;

        return replacement;
    });

    return {replaced, cursor};
}

export {replacer};
export default {replacer};
