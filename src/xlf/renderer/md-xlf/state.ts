import {XLFRulesState} from './rules';

export type XLFRendererState = XLFState & XLFRulesState;
export type XLFState = {
    xlf: {
        id: number;
        indentation: number;
    };
};

export type XLFInitStateParameters = {
    indentation: number;
};

function xlfInitState(parameters: XLFInitStateParameters) {
    return {
        xlf: {
            id: 1,
            indentation: parameters.indentation,
        },
    };
}

export {xlfInitState};
export default {xlfInitState};
