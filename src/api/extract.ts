import xlf from 'src/xlf';
import skeleton from 'src/skeleton';

export type ExtractParameters = xlf.renderer.RenderParameters & skeleton.renderer.RenderParameters;

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

    result.xlf = xlf.renderer.render(parameters as xlf.renderer.RenderParameters);
    result.skeleton = skeleton.renderer.render(parameters as skeleton.renderer.RenderParameters);

    return result;
}

function validParameters(parameters: ExtractParameters) {
    const conditions = [
        xlf.renderer.validParameters(parameters),
        skeleton.renderer.validParameters(parameters),
    ];

    return conditions.reduce((a, v) => a && v, true);
}

export {extract};
export default {extract};
