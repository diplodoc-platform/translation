import type {Gobbler, NonEmptyString} from 'src/skeleton/types';
import {mtre} from 'src/symbols';
import {CriticalProcessingError} from './error';

type SearchRule = (content: string, from: number, match: string) => [number, number, string];

const searchCommon: SearchRule = (content, from, match) => {
  const index = content.indexOf(match, from);

  return [index, index + match.length, match];
};

const searchTrimStart: SearchRule = (content, from, match) => {
  while (match.startsWith(' ')) {
    match = match.slice(1);

    const index = content.indexOf(match, from);

    if (index > -1) {
      return [index, index + match.length, match];
    }
  }

  return [-1, -1, ''];
};

const searchRegExp: SearchRule = (content, from, match) => {
  const variant = match.replace(/\\\\/g, '\\');
  const index = content.indexOf(variant, from);

  return [index, index + variant.length, variant];
};

const searchLinkText: SearchRule = (content, from, match) => {
  const variant = match.replace(/(\[|])/g, '\\$1');
  const index = content.indexOf(variant, from);

  return [index, index + variant.length, variant];
};

const searchMultilineInlineCode: SearchRule = (content, from, match) => {
  const parts = match.split(/[\s\n]/g);

  let index;
  const start = (index = content.indexOf(parts.shift() as string, from));
  while (parts.length && index > -1) {
    const part = parts.shift() as string;
    index = content.indexOf(part, index);
    index = index === -1 ? index : index + part.length;
  }

  if (index === -1) {
    return [-1, -1, match];
  }

  return [start, index, content.slice(start, index)];
};

export const search: Gobbler<NonEmptyString> = (content, [start, end], match) => {
  const matches = [
    searchCommon,
    searchTrimStart,
    searchRegExp,
    searchLinkText,
    searchMultilineInlineCode,
  ];

  match = match.replace(mtre, '') as NonEmptyString;
  if (!match) {
    return [start, start, ''];
  }

  let from = -1,
    to = -1,
    variant: string = match;
  while (matches.length && from === -1) {
    start = start === -1 ? 0 : start;
    [from, to, variant] = (matches.shift() as SearchRule)(content, start, match);
  }

  if (from < start || to > end) {
    throw new CriticalProcessingError({start, end}, content, match);
  }

  return [from, to, variant];
};
