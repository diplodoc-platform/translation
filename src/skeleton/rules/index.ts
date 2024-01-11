import Renderer from 'markdown-it/lib/renderer';
import {diplodoc} from './diplodoc';
import {codeInline} from './code-inline';
import {heading} from './heading';

const rules: Renderer.RenderRuleRecord = {
    ...diplodoc,
    ...heading,
    ...codeInline,
};

export {rules};
export default {rules};
