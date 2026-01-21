import type {JSONObject, RefDefinition, RefLink} from '../types';

import {isObject, isString, uniq} from '../utils';

export const Ref = Symbol('Ref');

export const Disabled = Symbol('Disabled');

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
    let disabled = false;

    return new Proxy(ref, {
        ownKeys(target) {
            if (disabled) {
                return Reflect.ownKeys(def);
            }

            const noref = (key: string | symbol): key is string => isString(key) && key !== '$ref';
            const keys = [...Reflect.ownKeys(target), ...Reflect.ownKeys(def)].filter(noref);

            return uniq(keys);
        },

        has(target, key) {
            if (disabled) {
                return key in def;
            }

            return key in target || key in def;
        },

        get(target: Container, key) {
            if (key === Ref) {
                return def;
            }

            if (disabled) {
                return (def as Container)[key];
            }

            if (key in target) {
                return target[key];
            } else if (key in def && key !== '$ref') {
                return (def as Container)[key];
            }

            return undefined;
        },

        set(target: Container, key, value) {
            if (key === Disabled) {
                disabled = value;
                return true;
            }

            if (disabled) {
                if (key in def) {
                    (def as Container)[key] = value;
                }

                return true;
            }

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

export function isProxy(item: unknown): item is RefLink {
    return isObject(item) && Boolean(item[Ref]);
}

export function disable(proxy: Container) {
    proxy[Disabled] = true;
}
