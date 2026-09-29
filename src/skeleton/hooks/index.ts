import {CustomRendererLifeCycle} from 'src/renderer';

import {meta} from './meta';
import {afterInline} from './after-inline';
import {beforeInline} from './before-inline';
import {image} from './image';
import {tableTitle} from './table-title';

export const hooks = {
    [CustomRendererLifeCycle.BeforeRender]: [image, tableTitle, meta],
    [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
    [CustomRendererLifeCycle.BeforeInlineRender]: [beforeInline],
};
