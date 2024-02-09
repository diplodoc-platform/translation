import {RenderParams, render} from 'src/skeleton';

export type ExtractParams = RenderParams;

export type ExtractOutput = {
    skeleton: string;
    xliff: string;
    units: string[];
};

export function extract(parameters: ExtractParams): ExtractOutput {
    // upon recieving empty markdown give back empty xliff and skeleton
    if (!parameters.markdown) {
        return {xliff: '', units: [], skeleton: ''};
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

    return render(parameters);
}
