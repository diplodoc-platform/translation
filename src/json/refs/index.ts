import type {FileLoader, JSONData, JSONObject, LinkedJSONObject} from '../types';
import {ok} from 'node:assert';
import {isAbsolute} from 'node:path';
import {isObject, keys, last} from '../utils';
import {isRefLike} from './utils';
import {RefDetails} from './ref';
import {Ref, proxy} from './proxy';

const SKIP = Symbol('SKIP');

/**
 * Replaces parts of resolved by linkRefs JSON tree with original ref definitions.
 * Mutates original data.
 *
 * @param content - The structure to find JSON References within.
 *
 * @returns mutated array/object with resolved refs
 */
export async function unlinkRefs(content: LinkedJSONObject): Promise<JSONObject> {
  return walk(content, [], [], (item) => {
    if (isObject(item) && (item as Container)[Ref]) {
      return (item as Container)[Ref] as JSONData;
    }

    return item;
  }) as Promise<JSONObject>;
}

/**
 * Resolves JSON References defined within the provided object.
 * Mutates original data.
 * Skips circular references.
 *
 * @param content - The structure to find JSON References within.
 * @param location - Absolute path to provided structure for relative refs resolving.
 * @param loader - File loader for relative refs resolving.
 * There is no internal cache, so you need to cache resolved files manually in loader.
 *
 * @returns mutated array/object with resolved refs
 */
export async function linkRefs(
  content: JSONObject,
  location: string,
  loader: FileLoader,
): Promise<LinkedJSONObject> {
  ok(isObject(content), 'Content should be a json object');
  ok(isAbsolute(location), 'Location should be absolute path');

  return walk(content, [], [location], async (item, ancestors, locations) => {
    if (ancestors.includes(item as JSONObject)) {
      return SKIP;
    }

    if (!isRefLike(item)) {
      return item;
    }

    let value: JSONObject = item as JSONObject;
    while (isRefLike(value)) {
      const ref = new RefDetails(last(locations), value, loader);

      value = await ref.value();

      if (ancestors.includes(value)) {
        return SKIP;
      }

      ancestors.push(value);
      locations.push(ref.path);
    }

    return proxy(value, item);
  }) as Promise<LinkedJSONObject>;
}

type Walker<T> = (item: JSONData, ancestors: JSONObject[], locations: string[]) => T | Promise<T>;

async function walk(
  item: JSONData,
  ancestors: JSONObject[],
  locations: string[],
  fn: Walker<JSONData | typeof SKIP>,
) {
  const value = await fn(item as JSONData, ancestors, locations);

  if (value === SKIP) {
    return item;
  }

  if (Array.isArray(value)) {
    // eslint-disable-next-line guard-for-in
    for (const index in value) {
      value[index] = await walk(
        value[index],
        ancestors.concat(value as unknown as JSONObject),
        locations.slice(),
        fn,
      );
    }
  } else if (isObject(value) && !isRefLike(value)) {
    for (const key of keys(value)) {
      value[key] = await walk(value[key], ancestors.concat(value), locations.slice(), fn);
    }
  }

  return value;
}
