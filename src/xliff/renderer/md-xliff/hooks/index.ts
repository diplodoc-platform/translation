import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer';

import {afterInline} from './after-inline';

export const hooks = {
    [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
};
