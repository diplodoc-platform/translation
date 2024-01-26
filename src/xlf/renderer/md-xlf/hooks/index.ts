import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer';

import {afterInline} from './after-inline';
import {includes} from './diplodoc/includes';

function generate() {
    return {
        hooks: {
            [CustomRendererLifeCycle.BeforeRender]: [includes],
            [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
        },
    };
}

export {generate};
export default {generate};
