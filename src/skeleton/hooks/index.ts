import {CustomRendererLifeCycle} from 'src/renderer';
import {meta} from './meta';
import {afterInline} from './after-inline';
import {beforeInline} from './before-inline';
import {image} from './image';

export const hooks = {
    [CustomRendererLifeCycle.BeforeRender]: [image, meta],
    [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
    [CustomRendererLifeCycle.BeforeInlineRender]: [beforeInline],
};