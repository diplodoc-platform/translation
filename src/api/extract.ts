import xlf from 'src/xlf';
import skeleton from 'src/skeleton';

export type ExtractParameters = xlf.mdXLFRenderer.RenderParameters &
    skeleton.renderer.RenderParameters;

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
        // eslint-disable-next-line no-param-reassign
        parameters.markdownPath = 'markdown.md';
    }

    if (!parameters.skeletonPath) {
        // eslint-disable-next-line no-param-reassign
        parameters.skeletonPath = 'markdown.skl.md';
    }

    if (!validParameters(parameters)) {
        throw new Error('invalid parameters');
    }

    result.xlf = xlf.mdXLFRenderer.render(parameters);
    result.skeleton = skeleton.renderer.render(parameters);

    return result;
}

function validParameters(parameters: ExtractParameters) {
    const conditions = [
        xlf.mdXLFRenderer.validParameters(parameters),
        skeleton.renderer.validParameters(parameters),
    ];

    return conditions.reduce((a, v) => a && v, true);
}

export {extract};
export default {extract};
