import {ok} from 'node:assert';
import {extname, isAbsolute, normalize, resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {load} from 'js-yaml';

import {parseURI} from 'src/json/refs/utils';

export function readPath(path: string) {
    ok(isAbsolute(path), 'FileInfo path should be absolute');

    const parse = extname(path) === '.yaml' ? load : JSON.parse;
    const data = parse(readFileSync(path, 'utf8'));

    return {path, data};
}

export function normalizePath(path: string) {
    const uri = parseURI(normalize(path).replace(/\\/g, '/'));

    if (uri.fragment) {
        return (uri.path || '') + '#' + uri.fragment;
    }

    return (uri.path || '').replace(/\/$/, '');
}

export function absolutePath(location: string, root?: string) {
    if (location.indexOf('://') === -1 && !isAbsolute(location)) {
        return resolve(root || process.cwd(), location);
    } else {
        return location;
    }
}

export function isObject<T = unknown>(object: unknown): object is Container<T> {
    return Boolean(object && typeof object === 'object');
}

export function isString(string: unknown): string is string {
    return typeof string === 'string';
}

export function keys(target: Hash) {
    return Object.keys(target);
}

export function uniq<T = string>(array: T[]): T[] {
    return [...new Set(array)];
}

export function tail<T>(array: T[], offset = 0) {
    return array[array.length - 1 - offset];
}
