import {XLFRulesState, initState} from './rules';

export type XLFRenderState = XLFRulesState;

export type XLFInitStateParams = XLFRulesState;

export function state(externalState: XLFInitStateParams) {
    return {
        ...initState(),
        ...externalState,
    };
}
