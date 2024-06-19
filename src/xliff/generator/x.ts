import {gt, lt, qt, sl} from 'src/xliff/symbols';
import {snakeCase} from './utils';

export type GenerateXParams = {
  ctype: string;
  equivText: string;
} & {
  [prop: string]: string;
};

export function generateX(parameters: GenerateXParams) {
  const props = Object.keys(parameters)
      .map((key) => `${snakeCase(key)}=${qt}${parameters[key]}${qt}`)
      .join(' ');

  return `${lt}x${props.length ? ' ' + props : ''}${sl + gt}`;
}
