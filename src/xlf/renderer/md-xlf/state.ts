import {XLFRulesState} from './rules';

export type XLFRenderState = XLFRulesState;

export type XLFInitStateParams = XLFRulesState;

export function state(externalState: XLFInitStateParams) {
    return externalState;
}
