import type {JSONData, JSONObject, ResolvedRefDetails, UnresolvedRefDetails} from './types';
import {ok} from 'assert';
import {dirname, isAbsolute, resolve} from 'node:path';
import {resolveRefs} from './refs';
import {isString, walkPath} from './utils';

type UrlDetails = {
  fragment: string;
  path: string;
};

type FileLoader = (path: string) => Promise<JSONData>;

const Ref = Symbol('$ref');

export type RefLink = {
  [Ref]: ResolvedRefDetails & UnresolvedRefDetails;
};

const keys = (target: Hash) => Object.keys(target);
const assign = (target: Hash, key: string, value: unknown) => Object.assign(target, {[key]: value});
const uniq = (array: string[]): string[] => [...new Set(array)];

function normalizeURI(uri: string, root?: string) {
  let path = uri.split('#')[0];

  if (root) {
    path = resolve(root, path);
  }

  return path.replace(/\/$/, '');
}

export function unlinkRefs(content: JSONObject<RefLink>) {
  const unlink = <T extends JSONData<RefLink>>(item: T): T => {
    if (Array.isArray(item)) {
      // eslint-disable-next-line guard-for-in
      for (const index in item) {
        item[index] = unlink(item[index]);
      }
    } else if (item && typeof item === 'object') {
      if (item[Ref]) {
        return item[Ref].def as unknown as T;
      }

      for (const key of keys(item)) {
        assign(item, key, unlink(item[key]));
      }
    }

    return item;
  };

  for (const key of keys(content)) {
    assign(content, key, unlink(content[key]));
  }
}

export async function linkRefs(content: JSONObject, location: string, loader: FileLoader) {
  ok(isAbsolute(location), 'Location should be absolute path');

  const roots: Record<string, JSONObject> = {
    [location]: content,
  };
  const register = (location: string, path: string[], ref: UnresolvedRefDetails) => {
    const {parent, point, leaf} = walkPath(path, roots[location]);
    const details = ref.uriDetails as UrlDetails;
    const link = normalizeURI(details.path, dirname(location));
    const fragment = details.fragment.slice(1).split('/');

    const root = roots[ref.type === 'relative' ? link : location];

    ok(
      root,
      `Unable to resolve ${ref.type} reference ${ref.type === 'relative' ? link : location}`,
    );

    const branch = walkPath(fragment, root);

    Object.defineProperty(parent, point, {
      value: new Proxy(branch.leaf, {
        ownKeys(target) {
          const noref = (key: string | symbol): key is string => isString(key) && key !== '$ref';
          const keys = [...Reflect.ownKeys(target), ...Reflect.ownKeys(ref.def)].filter(noref);

          return uniq(keys);
        },

        has(target, key) {
          return key in target || key in ref.def;
        },

        get(target: Container, key) {
          if (key === Ref) {
            return ref;
          }

          if (key in target) {
            return target[key];
          } else if (key in leaf) {
            return (ref.def as Container)[key];
          }

          return undefined;
        },

        set(target: Container, key, value) {
          if (key in target) {
            target[key] = value;
          } else if (key in leaf) {
            (ref.def as Container)[key] = value;
          } else {
            target[key] = value;
          }

          return true;
        },
      }),
    });
  };

  const work: [string, string[], UnresolvedRefDetails][] = [];
  const refs = await resolveRefs(content, {
    location,
    onRef: function (info, path) {
      work.push([normalizeURI(info.location), path.slice(), info]);
    },
    loader: async (location: string) => {
      location = normalizeURI(location);

      if (!roots[location]) {
        roots[location] = (await loader(location)) as JSONObject;
      }

      return roots[location];
    },
  });

  const ref = (key: string) => refs[key as keyof typeof refs];
  const missed = keys(refs)
    .filter((key) => ref(key).missing)
    .map((key) => key + ': ' + (ref(key).error || ref(key).uri));

  if (missed.length) {
    throw new Error("Can't resolve json refs:\n" + missed.join('\n'));
  }

  for (const [location, path, info] of work.reverse()) {
    register(location, path, info);
  }

  return roots[location];
}
