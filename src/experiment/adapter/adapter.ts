import {ComposeOptions, ComposeOutput, ExtractOptions, ExtractOutput} from 'src/experiment/adapter/types';
import {transform} from 'src/experiment/transform';
import {translate} from 'src/experiment/translate';

export function extract(content: string, options: ExtractOptions): ExtractOutput {
  const {xliff, skeleton} = transform(content);

  xliff.setFile(options.originalFile);
  xliff.setSourceLanguage(`${options.source.language}-${options.source.locale}`);
  xliff.setTargetLanguage(`${options.target.language}-${options.target.locale}`);
  if (options.skeletonFile) {
    xliff.setSkeletonFile(options.skeletonFile);
  }

  return {
    skeleton,
    xliff,
  };
}

export function compose(
  skeleton: string,
  xliff: string,
  options: ComposeOptions,
): ComposeOutput {

  return translate(xliff, skeleton, options);
}
