export type ComposeParameters = {
    skeleton: string;
    xlf: string;
};

function compose(parameters: ComposeParameters) {
    if (!validate(parameters)) {
        throw new Error('invalid parameters');
    }
}

function validate(parameters: ComposeParameters) {
    return parameters.skeleton !== undefined && parameters.xlf !== undefined;
}

export {compose};
export default {compose};
