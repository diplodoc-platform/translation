import skeleton from 'src/skeleton';

export type ExtractParams = skeleton.renderer.RenderParams;

export type ExtractOutput = {
    skeleton: string;
    xlf: string;
    units: string[];
};

export function extract(parameters: ExtractParams): ExtractOutput {
    // upon recieving empty markdown give back empty xlf and skeleton
    if (!parameters.markdown) {
        return {xlf: '', units: [], skeleton: ''};
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

    return skeleton.renderer.render(parameters);
}
