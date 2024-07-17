import {ComposeOptions, ExtractOptions, ExtractOutput} from 'src/experiment/adapter/types';
import {transform} from 'src/experiment/transform';
import {translate} from 'src/experiment/translate';

export function extract(content: string, options: ExtractOptions): ExtractOutput<string> {
  Boolean(options);

  const {xliff, skeleton} = transform(content);

  xliff.setFile('file.ext');
  xliff.setSkeletonFile('file.skl');
  xliff.setSourceLanguage(`${options.source.language}-${options.source.locale}`);
  xliff.setTargetLanguage(`${options.target.language}-${options.target.locale}`);

  return {
    skeleton,
    xliff: xliff.toString(),
    units: xliff.transUnits.map((unit) => unit.toString()),
  };
}

export function compose(
  skeleton: string,
  xliff: string | string[],
  options: ComposeOptions,
): string {
  if (typeof xliff !== 'string') {
    throw new Error('Unavailable input');
  }

  const {document} = translate(xliff, skeleton, options);

  return document;
}
