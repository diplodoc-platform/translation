import type {JSONObject, RefDefinition} from '../types';

import * as URI from 'uri-js';

import {isObject, isString} from '../utils';

/**
 * Takes an array of path segments and decodes the JSON Pointer tokens in them.
 *
 * @param path - The array of path segments
 *
 * @returns the array of path segments with their JSON Pointer tokens decoded
 *
 * @throws if the path is not an `Array`
 *
 * @see {@link https://tools.ietf.org/html/rfc6901#section-3}
 */
function decodePath(path: string[]) {
    return path.map((seg) => {
        if (!isString(seg)) {
            seg = JSON.stringify(seg);
        }

        return seg.replace(/~1/g, '/').replace(/~0/g, '~');
    });
}

/**
 * Takes an array of path segments and encodes the special JSON Pointer characters in them.
 *
 * @param path - the array of path segments
 *
 * @returns the array of path segments with their JSON Pointer tokens encoded
 *
 * @throws if the path is not an `Array`
 *
 * @see {@link https://tools.ietf.org/html/rfc6901#section-3}
 */
function encodePath(path: string[]) {
    return path.map((seg) => {
        if (!isString(seg)) {
            seg = JSON.stringify(seg);
        }

        return seg.replace(/~/g, '~0').replace(/\//g, '~1');
    });
}

/**
 * Returns whether the argument represents a JSON Pointer.
 *
 * A string is a JSON Pointer if the following are all true:
 *
 *   * The string is of type `String`
 *   * The string must be empty, `#` or start with a `/` or `#/`
 *
 * @param ptr - The string to check
 *
 * @returns the result of the check
 *
 * @throws when the provided value is invalid and the `throwWithDetails` argument is `true`
 *
 * @see {@link https://tools.ietf.org/html/rfc6901#section-3}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPtr(ptr: any) {
    if (!isString(ptr)) {
        throw new Error('ptr is not a String');
    }

    if (!ptr) {
        return;
    }

    if (!ptr.match(/^#?\/|^#$/)) {
        throw new Error('ptr must start with a / or #/');
    } else if (ptr.match(/~(?:[^01]|$)/g)) {
        throw new Error('ptr has invalid token(s)');
    }
}

/**
 * Returns an array of path segments for the provided JSON Pointer.
 *
 * @param ptr - The JSON Pointer
 *
 * @returns the path segments
 *
 * @throws if the provided `ptr` argument is not a JSON Pointer
 */
export function pathFromPtr(ptr: string): string[] {
    try {
        isPtr(ptr);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        throw new Error('ptr must be a JSON Pointer: ' + error.message);
    }

    const segments = ptr.split('/');

    // Remove the first segment
    segments.shift();

    return decodePath(segments);
}

/**
 * Returns a JSON Pointer for the provided array of path segments.
 *
 * **Note:** If a path segment in `path` is not a `String`, it will be converted to one using `JSON.stringify`.
 *
 * @param path - The array of path segments
 * @param [hashPrefix=true] - Whether or not create a hash-prefixed JSON Pointer
 *
 * @returns the corresponding JSON Pointer
 *
 * @throws if the `path` argument is not an array
 */
export function pathToPtr(path: string[], hashPrefix?: boolean): string {
    if (!Array.isArray(path)) {
        throw new Error('path must be an Array');
    }

    // Encode each segment and return
    return (
        (hashPrefix === false ? '' : '#') +
        (path.length > 0 ? '/' : '') +
        encodePath(path).join('/')
    );
}

export function parseURI(uri: string) {
    const result = URI.parse(uri);

    if (result.error) {
        throw new Error(result.error);
    }

    return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isRefLike(obj: any): obj is RefDefinition {
    return isObject(obj) && isString(obj.$ref);
}

export function get(obj: JSONObject, path: string[]) {
    let value = obj;

    for (const seg of path) {
        if (seg in value) {
            value = value[seg] as JSONObject;
        } else {
            throw Error('JSON Pointer points to missing location: ' + pathToPtr(path));
        }
    }

    return value;
}
