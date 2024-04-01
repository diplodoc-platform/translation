import {toXLIFF} from 'src/xliff';

export type Hash = ReturnType<typeof hash>;

export function hash() {
  const segments = new Array<string>();
  const res = function (tokens: Token[]) {
    const unitId = segments.length;
    const xliff = toXLIFF(tokens, unitId);

    segments.push(xliff);

    return '%%%' + unitId + '%%%';
  };

  res.segments = segments;

  return res;
}
