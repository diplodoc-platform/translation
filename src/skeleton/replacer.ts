import {sentenize} from '@diplodoc/sentenizer';

import {replaceAfter} from 'src/string';
import {SkeletonRendererState} from './renderer';
import {mdXLFRenderer} from 'src/xlf';

function replacer(content: string, state: SkeletonRendererState, heading?: string) {
    let replaced = content;
    let index = 0;

    for (const segment of sentenize(content)) {
        let markdown = segment.replace(
            /\$\$\$code-(\d+)\$\$\$/g,
            (_, $1) => state.code.fragments[$1],
        );

        if (heading && !index) {
            markdown = heading + ' ' + markdown;
        }

        const xlf = mdXLFRenderer.render(markdown, {
            unitId: state.skeleton.id,
            lang: 'ru'
        });

        state.skeleton.segments.push(xlf);

        const hash = `%%%${state.skeleton.id}%%%`;

        let cursor = 0;

        ({replaced, cursor} = replaceAfter(replaced, segment, hash, cursor));

        // eslint-disable-next-line no-param-reassign
        state.skeleton.id++;
        index++;
    }

    return replaced;
}

export {replacer};
export default {replacer};
