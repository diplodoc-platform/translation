import type {JSONObject, RefDefinition} from '../types';
import {isObject, isString, uniq} from '../utils';
import {RefLink} from '../types';

export const Ref = Symbol('Ref');

export const Enabled = Symbol('Enabled');

/**
 * Creates a special proxy which stores information about original ref definition
 * and resolved ref.
 * Allows to mutate data in ref and ref definition.
 *
 * @param ref - Resolved reference.
 * @param def - Reference definition.
 *
 * @returns Merged proxy object.
 */
export function proxy(ref: JSONObject, def: RefDefinition) {
  let enabled = true;

  return new Proxy(ref, {
    ownKeys(target) {
      if (!enabled) {
        return Reflect.ownKeys(def);
      }

      const noref = (key: string | symbol): key is string => isString(key) && key !== '$ref';
      const keys = [...Reflect.ownKeys(target), ...Reflect.ownKeys(def)].filter(noref);

      return uniq(keys);
    },

    has(target, key) {
      return key in target || key in def;
    },

    get(target: Container, key) {
      if (key === Ref) {
        return def;
      }

      if (key in target) {
        return target[key];
      } else if (key in def && key !== '$ref') {
        return (def as Container)[key];
      }

      return undefined;
    },

    set(target: Container, key, value) {
      if (key === Enabled) {
        enabled = value;
      } else if (key in target) {
        target[key] = value;
      } else if (key in def) {
        (def as Container)[key] = value;
      } else {
        target[key] = value;
      }

      return true;
    },
  });
}

export function isProxy(item: any): item is RefLink {
  return isObject(item) && Boolean(item[Ref]);
}

export function disable(proxy: Container) {
  proxy[Enabled] = false;
}
