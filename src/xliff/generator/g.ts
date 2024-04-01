import {gt, lt, qt, sl} from 'src/xliff/symbols';

export type OpenGParams = {
  ctype: string;
  equivText: string;
  'x-begin': string;
  'x-end': string;
} & {
  [prop: string]: string;
};

export function generateOpenG(parameters: OpenGParams): string {
  const props = Object.keys(parameters)
    .map((key) => `${key}=${qt}${parameters[key]}${qt}`)
    .join(' ');

  return `${lt}g ${props}${gt}`;
}

export function generateCloseG(): string {
  return `${lt}${sl}g${gt}`;
}
