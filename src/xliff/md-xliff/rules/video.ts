import type {Renderer, Token} from 'markdown-it';
import type {VideoToken} from '@diplodoc/transform/lib/plugins/video/types';

import {generateX} from 'src/xliff/generator';

export const video: Renderer['rules'] = {
    video: videoRule,
};

function videoRule(tokens: Token[], i: number) {
    const {service, videoID} = tokens[i] as VideoToken;

    return generateX({ctype: 'video', equivText: `@[${service}](${videoID})`});
}
