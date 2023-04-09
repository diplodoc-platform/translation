import xlf from 'src/xlf';

import {RenderParameters} from 'src/xlf/renderer';

export type ExtractParameters = RenderParameters;
export type ExtractOutput = {
    skeleton: string;
    xlf: string;
};

function extract(parameters: ExtractParameters): ExtractOutput {
    const result = {
        xlf: '',
        skeleton: '',
    };

    // upon recieving empty markdown give back empty xlf and skeleton
    if (!parameters.markdown) {
        return result;
    }

    // proper defaults for markdown and skeleton ids
    if (!parameters.markdownPath) {
        parameters.markdownPath = 'markdown.md';
    }

    if (!parameters.skeletonPath) {
        parameters.skeletonPath = 'markdown.skl.md';
    }

    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    result.xlf = xlf.renderer.render(parameters as RenderParameters);

    return result;
}

function validParameters(parameters: ExtractParameters) {
    return xlf.renderer.validParameters(parameters);
}

export {extract};
export default {extract};
