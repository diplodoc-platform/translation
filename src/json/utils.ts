import type {URIComponents} from 'uri-js';
import type {JSONData, UnresolvedRefDetails} from './types';
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

export function omit(donor: object, props: string[]) {
  return Object.keys(donor).reduce((acc, key) => {
    if (!props.includes(key)) {
      // @ts-ignore
      acc[key] = donor[key];
    }

    return acc;
  }, {});
}

type WalkContext = {
  parent: object | null;
  leaf: object;
  point: string;
};

export function walkPath(path: string[], root: JSONData): WalkContext {
  return path.reduce(
    ({parent, leaf}: WalkContext, point: string) => {
      parent = leaf as object;
      // @ts-ignore
      leaf = leaf[point] as object;

      return {parent, point, leaf};
    },
    {parent: null, leaf: root, point: ''} as WalkContext,
  );
}

export function makeAbsolute(location: string) {
  if (location.indexOf('://') === -1 && !isAbsolute(location)) {
    return resolve(process.cwd(), location);
  } else {
    return location;
  }
}

const remoteTypes = ['relative', 'remote'];
const remoteUriTypes = ['absolute', 'uri'];
const localUriTypes = ['same-document'];

export function isRemoteUri(uriDetails: URIComponents) {
  return remoteUriTypes.indexOf(uriDetails.reference || '') > -1;
}

export function isLocalUri(uriDetails: URIComponents) {
  return localUriTypes.indexOf(uriDetails.reference || '') > -1;
}

export function refType(refDetails: UnresolvedRefDetails) {
  if (isRemoteUri(refDetails.uriDetails)) {
    return 'remote';
  }

  if (isLocalUri(refDetails.uriDetails)) {
    return 'local';
  }

  return refDetails.uriDetails.reference || '';
}

export function isRemoteRef(refDetails: UnresolvedRefDetails) {
  return remoteTypes.indexOf(refType(refDetails)) > -1;
}

export function isValidRef(refDetails: UnresolvedRefDetails) {
  return refDetails.error === undefined && refDetails.type !== 'invalid';
}

export function isObject(object: any): object is Container {
  return object && typeof object === 'object';
}

export function isString(string: any): string is string {
  return typeof string === 'string';
}
