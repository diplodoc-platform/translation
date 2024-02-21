import type {UnresolvedRefDetails} from 'json-refs';
import type {JSONValue} from 'src/json/index';
import {dirname, join} from 'node:path';
import {resolveRefs} from 'json-refs';
import {omit, walkPath} from './utils';

type ResolveRefsContext = {
    location: string;
};

type LoaderResponse = {
    text: string;
    location: string;
};

type Callback = (error: Error | null, result?: unknown) => void;

type UrlDetails = {
    fragment: string;
    path: string;
};

type Parser = (content: string, path: string) => JSONValue;

export async function resolve(content: object, location: string, parse: Parser) {
    const roots: Record<string, object> = {
        [location]: content,
    };
    const register = (location: string, path: string[], info: UnresolvedRefDetails) => {
        const {parent, point, leaf} = walkPath(path, roots[location]);

        const type = info.type;
        const details = info.uriDetails as UrlDetails;
        const ref = join(dirname(location), details.path);
        const fragment = details.fragment.slice(1).split('/');

        Object.defineProperty(parent, point, {
            get() {
                const root = {
                    relative: roots[ref],
                    local: roots[location],
                }[type];

                if (!root) {
                    throw new Error(`Unable to resolve ${type} reference ${ref || location}`);
                }

                const branch = walkPath(fragment, root);

                const value = {
                    // $$ref: ref,
                    ...omit(leaf, ['$ref']),
                    ...branch.leaf,
                };

                Object.defineProperty(this, point, {value});

                return this[point];
            }
        });
    };

    const {refs} = await resolveRefs(content, {
        location,
        refPostProcessor: function(this: ResolveRefsContext, info, path) {
            register(this.location, path, info);

            return info;
        },
        loaderOptions: {
            processContent: (info: LoaderResponse, callback: Callback) => {
                const {text, location} = info;

                try {
                    roots[location] = Object.assign(roots[location] || {}, parse(text, location));
                    return callback(null, roots[location]);
                } catch (error: any) {
                    return callback(error);
                }
            }
        }
    });

    const ref = (key: string) => refs[key as keyof typeof refs];
    const missed = Object.keys(refs)
        .filter((key) => ref(key).missing)
        .map((key) => key + ': ' + (ref(key).error || ref(key).uri));

    if (missed.length) {
        throw new Error('Can\'t resolve json refs:\n' + missed.join('\n'));
    }

    return roots[location];
}

