import type Renderer from 'markdown-it/lib/renderer';
import type Token from 'markdown-it/lib/token';

import {VideoToken} from '@diplodoc/transform/lib/plugins/video/types';

import {generateX} from 'src/xliff/generator';

export const video: Renderer.RenderRuleRecord = {
    video: videoRule,
};

function videoRule(tokens: Token[], i: number) {
    const {service, videoID} = tokens[i] as VideoToken;

    return generateX({ctype: 'video', equivText: `@[${service}](${videoID})`});
}
