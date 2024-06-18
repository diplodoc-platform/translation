import type {URIComponents} from 'uri-js';
import type {FileLoader, JSONObject, RefDefinition} from '../types';
import {dirname} from 'node:path';
import {absolute} from '../utils';
import {get, isPtr, parseURI, pathFromPtr} from './utils';

function normalize(path: string) {
  return path.replace(/\\/g, '/').replace(/\/$/, '');
}

export class RefDetails {
  private uri: URIComponents;

  private loader: FileLoader;

  get path() {
    return this.uri.path || '';
  }

  get fragment() {
    return this.uri.fragment || '';
  }

  constructor(location: string, def: RefDefinition, loader: FileLoader) {
    const uri =
      ['#', '/'].indexOf(def.$ref[0]) > -1
        ? location + def.$ref
        : absolute(def.$ref, dirname(location));

    this.uri = parseURI(uri);
    this.loader = loader;

    isPtr(this.fragment);
  }

  async document() {
    return this.loader(decodeURI(normalize(this.path)));
  }

  async value(): Promise<JSONObject> {
    const document = await this.document();
    const path = pathFromPtr(decodeURI(this.fragment));

    return get(document, path);
  }
}
