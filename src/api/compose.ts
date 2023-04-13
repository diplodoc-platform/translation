import xlf from 'src/xlf';

export type ComposeParameters = {
    skeleton: string;
    xlf: string;
};

function compose(parameters: ComposeParameters) {
    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    const translations = xlf.parser.translationUnits(parameters.xlf);
}

function validParameters(parameters: ComposeParameters) {
    const conditions = [
        parameters.skeleton !== undefined,
        parameters.xlf !== undefined,
        xlf.parser.validParameters(parameters.xlf),
    ];

    return conditions.reduce((a, v) => a && v, true);
}

export {compose};
export default {compose};
