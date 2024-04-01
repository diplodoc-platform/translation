import type {TemplateOptions} from 'src/xliff';
import type {SkeletonOptions} from 'src/skeleton';
import {hash} from 'src/hash';
import {skeleton} from 'src/skeleton';
import {fromXLIFF, parse, template} from 'src/xliff';
import {replace} from 'src/utils';

export type ExtractOptions = TemplateOptions & SkeletonOptions;

export type ExtractOutput = {
  skeleton: string;
  xliff: string;
  units: string[];
};

export type ComposeOptions = {
  useSource?: boolean;
};

export function extract(content: string, options: ExtractOptions): ExtractOutput {
  if (!content) {
    return {xliff: '', units: [], skeleton: ''};
  }

  const hashed = hash();

  return {
    skeleton: skeleton(content, options, hashed),
    xliff: template(hashed.segments, options),
    units: hashed.segments,
  };
}

export function compose(skeleton: string, xliff: string | string[], {useSource = false}) {
  const units = parse(xliff, {useSource}).map(fromXLIFF);

  return replace(skeleton, units)[0];
}
