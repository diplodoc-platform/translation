import type {JSONObject, RefDefinition} from '../types';
import {isString, uniq} from '../utils';

export const Ref = Symbol('Ref');

export function proxy(ref: JSONObject, def: RefDefinition) {
  return new Proxy(ref, {
    ownKeys(target) {
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
      if (key in target) {
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
