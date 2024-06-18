import {ok} from 'node:assert';
import {extname, isAbsolute, resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {load} from 'js-yaml';

export function readPath(path: string) {
  ok(isAbsolute(path), 'FileInfo path should be absolute');

  const parse = extname(path) === '.yaml' ? load : JSON.parse;
  const data = parse(readFileSync(path, 'utf8'));

  return {path, data};
}

export function absolute(location: string, root?: string) {
  if (location.indexOf('://') === -1 && !isAbsolute(location)) {
    return resolve(root || process.cwd(), location);
  } else {
    return location;
  }
}

export function isObject<T = unknown>(object: any): object is Container<T> {
  return object && typeof object === 'object';
}

export function isString(string: any): string is string {
  return typeof string === 'string';
}

export function keys(target: Hash) {
  return Object.keys(target);
}

export function uniq<T = string>(array: T[]): T[] {
  return [...new Set(array)];
}

export function last<T>(array: T[]) {
  return array[array.length - 1];
}
