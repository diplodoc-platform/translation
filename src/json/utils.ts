import { ok } from 'node:assert';
import { extname, isAbsolute } from 'node:path';
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';

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

export function walkPath(path: string[], root: object): WalkContext {
    return path.reduce(({parent, leaf}: WalkContext, point: string) => {
        parent = leaf as object;
        // @ts-ignore
        leaf = leaf[point] as object;

        return {parent, point, leaf};
    }, {parent: null, leaf: root, point: ''} as WalkContext);
}