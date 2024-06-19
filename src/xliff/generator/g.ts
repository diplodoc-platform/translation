import {gt, lt, qt, sl} from 'src/xliff/symbols';
import {snakeCase} from './utils';

export type OpenGParams = {
  ctype: string;
  equivText: string;
  xBegin: string;
  xEnd: string;
} & {
  [prop: string]: string;
};

export function generateOpenG(parameters: OpenGParams): string {
  const props = Object.keys(parameters)
    .map((key) => `${snakeCase(key)}=${qt}${parameters[key]}${qt}`)
    .join(' ');

  return `${lt}g ${props}${gt}`;
}

export function generateCloseG(): string {
  return `${lt}${sl}g${gt}`;
}
