import skeleton from 'src/skeleton';

export type ExtractParameters = skeleton.renderer.RenderParameters;

export type ExtractOutput = {
    skeleton: string;
    xlf: string;
};

function extract(parameters: ExtractParameters): ExtractOutput {
    // upon recieving empty markdown give back empty xlf and skeleton
    if (!parameters.markdown) {
        return {xlf: '', skeleton: ''};
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

    return skeleton.renderer.render(parameters);
}

function validParameters(parameters: ExtractParameters) {
    return skeleton.renderer.validParameters(parameters);
}

export {extract};
export default {extract};
