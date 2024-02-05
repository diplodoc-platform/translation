import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

import {XLFRenderState} from 'src/xlf/renderer/md-xlf/state';
import {generateX} from 'src/xlf/generator';

import {VideoToken} from '@diplodoc/transform/lib/plugins/video/types';

export const video: Renderer.RenderRuleRecord = {
    video: videoRule,
};

function videoRule(this: CustomRenderer<XLFRenderState>, tokens: Token[], i: number) {
    const {service, videoID} = tokens[i] as VideoToken;

    return generateX({ctype: 'video', equivText: `@[${service}](${videoID})`});
}
