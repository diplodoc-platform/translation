import type {TemplateOptions} from 'src/xliff';
import type {SkeletonOptions} from 'src/skeleton';
import type {IdOptions} from 'src/hash';

import {hash} from 'src/hash';
import {skeleton} from 'src/skeleton';
import {fromXLIFF, parse, template} from 'src/xliff';
import {replace} from 'src/utils';

export type ExtractOptions = TemplateOptions & SkeletonOptions & IdOptions;

export type ExtractOutput = {
    skeleton: string;
    xliff: string;
    units: string[];
    /** Problems that left a part of the content untranslated, one line each. */
    warnings: string[];
};

export type ComposeOptions = {
    useSource?: boolean;
};

export function extract(content: string, options: ExtractOptions): ExtractOutput {
    if (!content) {
        return {xliff: '', units: [], skeleton: '', warnings: []};
    }

    const hashed = hash({unitLocalIds: options.unitLocalIds});
    const warnings: string[] = [];

    return {
        skeleton: skeleton(content, options, hashed, warnings),
        xliff: template(hashed.segments, options),
        units: hashed.segments,
        warnings,
    };
}

export function compose(skeleton: string, xliff: string | string[], {useSource = false}) {
    const units = parse(xliff, {useSource}).map(fromXLIFF);

    return replace(skeleton, units)[0];
}
