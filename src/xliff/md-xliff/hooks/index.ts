import {CustomRendererLifeCycle} from 'src/renderer';

import {afterInline} from './after-inline';

export const hooks = {
    [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
};
