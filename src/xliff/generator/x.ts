import {gt, lt, qt, sl} from 'src/xliff/symbols';
import {snakeCase} from './utils';

export type GenerateXParams = {
  ctype: string;
  equivText: string;
} & {
  [prop: string]: string;
};

export function generateX(parameters: GenerateXParams) {
  parameters = {...parameters, ...id()};

  const props = Object.keys(parameters)
    .sort()
    .map((key) => `${snakeCase(key)}=${qt}${parameters[key]}${qt}`)
    .join(' ');

  return `${lt}x ${props}${sl + gt}`;
}

let ID = 1;
function id() {
  return {id: 'x-' + ID++};
}
