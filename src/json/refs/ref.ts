import type {URIComponents} from 'uri-js';
import type {FileLoader, JSONObject, RefDefinition} from '../types';

import {dirname} from 'node:path';

import {absolutePath, normalizePath} from '../utils';

import {get, isPtr, parseURI, pathFromPtr} from './utils';

export class RefDetails {
    private readonly uri: URIComponents;

    private readonly loader: FileLoader;

    get path() {
        return normalizePath(this.uri.path || '');
    }

    get fragment() {
        return this.uri.fragment || '';
    }

    constructor(location: string, def: RefDefinition, loader: FileLoader) {
        const uri =
            ['#', '/'].indexOf(def.$ref[0]) > -1
                ? location + def.$ref
                : absolutePath(def.$ref, dirname(location));

        this.uri = parseURI(normalizePath(uri));
        this.loader = loader;

        isPtr(this.fragment);
    }

    async document() {
        return this.loader(decodeURI(normalizePath(this.path)));
    }

    async value(): Promise<JSONObject> {
        const document = await this.document();
        const path = pathFromPtr(decodeURI(this.fragment));

        return get(document, path);
    }
}
