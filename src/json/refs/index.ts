import type {FileLoader, JSONData, JSONObject, LinkedJSONObject} from '../types';
import {ok} from 'node:assert';
import {isAbsolute} from 'node:path';
import {isObject, keys, normalizePath, tail} from '../utils';
import {isRefLike} from './utils';
import {RefDetails} from './ref';
import {Ref, disable, isProxy, proxy} from './proxy';

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
  return walk(content, new WalkerContext(), (item) => {
    if (isProxy(item)) {
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
 *
 * @returns mutated array/object with resolved refs
 */
export async function linkRefs(content: JSONObject, location: string, loader: FileLoader) {
  ok(isObject(content), 'Content should be a json object');
  ok(isAbsolute(location), 'Location should be absolute path');

  location = normalizePath(location);
  loader = ((loader, cache) => async (path: string) => {
    path = normalizePath(path);

    if (!cache[path]) {
      cache[path] = await loader(path);
    }

    return cache[path];
  })(loader, {
    [location]: content,
  });

  await walk(content, new WalkerContext(location), async (item, context) => {
    if (!context.shouldVisit(item as JSONObject)) {
      return SKIP;
    }

    if (!isRefLike(item)) {
      return item;
    }

    let value: JSONObject = item as JSONObject;
    while (isRefLike(value)) {
      const ref = new RefDetails(context.location, value, loader);

      context.location = ref.path;

      value = await ref.value();

      if (!context.shouldVisit(value)) {
        return SKIP;
      }
    }

    return proxy(value, item);
  });

  await unlinkCycles(content);

  return content;
}

async function unlinkCycles(content: JSONObject) {
  // Unlinks proxied objects which causes circular errors on JSON.stringify.
  return walk(content, new WalkerContext(), (item, context) => {
    // If context says that we shouldn't visit item,
    // this means that this item is already visited on this branch.
    // In other words this is a start of circular reference.
    if (!context.shouldVisit(item as JSONObject)) {
      // Finds all parents which are proxied.
      // Takes last of them.
      const proxy = tail(context.ancestors.filter(isProxy));

      disable(proxy);

      return SKIP;
    }

    return item;
  });
}

type Walker<Result> = (item: JSONData, context: WalkerContext) => Result | Promise<Result>;

async function walk(item: JSONData, context: WalkerContext, fn: Walker<JSONData | typeof SKIP>) {
  if (!Array.isArray(item) && !isObject(item)) {
    return item;
  }

  const value = await fn(item as JSONData, context);

  if (value === SKIP) {
    return item;
  }

  if (Array.isArray(value)) {
    // eslint-disable-next-line guard-for-in
    for (const index in value) {
      value[index] = await walk(value[index], context.copy(), fn);
    }
  } else if (isObject(value) && !isRefLike(value)) {
    for (const key of keys(value)) {
      value[key] = await walk(value[key], context.copy(), fn);
    }
  }

  return value;
}

class WalkerContext {
  readonly ancestors: JSONObject[] = [];

  location: string;

  constructor(location?: string, ancestors?: WalkerContext['ancestors']) {
    this.location = location || '';
    this.ancestors = (ancestors || []).slice();
  }

  shouldVisit(value: JSONObject) {
    if (this.ancestors.includes(value)) {
      return false;
    }

    this.ancestors.push(value);

    return true;
  }

  copy() {
    return new WalkerContext(this.location, this.ancestors);
  }
}
