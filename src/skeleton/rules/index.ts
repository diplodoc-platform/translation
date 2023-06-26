import Renderer from 'markdown-it/lib/renderer';
import {diplodoc} from './diplodoc';

const rules: Renderer.RenderRuleRecord = {
    ...diplodoc,
};

export {rules};
export default {rules};
