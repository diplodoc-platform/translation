import type {
  ExternalJsonRefsOptions,
  JSONObject,
  JsonRefsOptions,
  RefDefinition,
  ResolvedRefDetails,
  UnresolvedRefDetails,
} from './types';
import {dirname, join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {forOwn, times} from 'lodash';
import {Graph, alg} from 'graphlib';
import * as URI from 'uri-js';
import {
  isObject,
  isRemoteRef,
  isRemoteUri,
  isString,
  isValidRef,
  makeAbsolute,
  refType,
} from './utils';

/* Internal Functions */

const slash = (path: string) => path.replace(/\\/g, '/');

function combineURIs(u1: string | undefined, u2: string | undefined) {
  u1 = slash(u1 || '');
  u2 = slash(u2 || '');

  const u2Details = parseURI(u2);

  let details = u2Details;
  if (isRemoteUri(u2Details)) {
    details = u2Details;
  } else if (u1) {
    details = parseURI(u1);
    details.path = slash(join(details.path || '', u2Details.path || ''));
  }

  // Remove the fragment
  details.fragment = undefined;
  details.path = details.path || '';

  const prefix = isRemoteUri(details) && details.path.indexOf('../') === 0 ? '../' : '';

  // For relative URIs, add back the '..' since it was removed above
  return prefix + URI.serialize(details);
}

function findAncestors(obj: Hash, path: string[]) {
  const ancestors = [];

  let node = obj;

  if (path.length > 0) {
    path = path.slice(0, path.length - 1);

    for (const seg of path) {
      if (seg in node) {
        node = node[seg];
        ancestors.push(node);
      }
    }
  }

  return ancestors;
}

function findValue(obj: Hash, path: string[]) {
  let value = obj;

  for (const seg of path) {
    if (seg in value) {
      value = value[seg];
    } else {
      throw Error('JSON Pointer points to missing location: ' + pathToPtr(path));
    }
  }

  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRefLike(obj: any): obj is RefDefinition {
  return isObject(obj) && isString(obj.$ref);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSubDocPath(subDocPath: string | string[] | undefined): string[] {
  if (Array.isArray(subDocPath)) {
    return subDocPath;
  } else if (isString(subDocPath)) {
    return pathFromPtr(decodeURI(subDocPath));
  }

  return [];
}

function markMissing(refDetails: ResolvedRefDetails, error: Error) {
  refDetails.error = error.message;
  refDetails.missing = true;
}

function parseURI(uri: string) {
  // We decode first to avoid doubly encoding
  return URI.parse(uri);
}

type RefModelMetadata = {
  docs: Hash<JSONObject>;
  deps: Hash<Hash<string>>;
  refs: Hash<ResolvedRefDetails>;
};

function walk<N extends Hash, P extends string[]>(
  ancestors: Hash[],
  node: N,
  path: P,
  fn: (node: N, path: P) => boolean,
) {
  function walkItem(item: N, segment: string) {
    path.push(segment);
    walk(ancestors, item, path, fn);
    path.pop();
  }

  if (!fn(node, path)) {
    return;
  }

  // We do not process circular objects again
  if (ancestors.indexOf(node) === -1) {
    ancestors.push(node);

    if (Array.isArray(node)) {
      node.forEach((member, index) => {
        walkItem(member, index.toString());
      });
    } else if (isObject(node)) {
      forOwn(node, (cNode, key) => {
        walkItem(cNode, key);
      });
    }

    ancestors.pop();
  }
}

function validateOptions(options: JsonRefsOptions, obj: JSONObject): JsonRefsOptions {
  // Validate the provided document
  if (!Array.isArray(obj) && !isObject(obj)) {
    throw new TypeError('obj must be an Array or an Object');
  }

  if (!options) {
    // Default to an empty options object
    options = {} as JsonRefsOptions;
  } else if (!isObject(options)) {
    throw new TypeError('options must be an Object');
  } else {
    // Clone the options so we do not alter the ones passed in
    options = {...options};
  }

  if (!options.location || !isString(options.location)) {
    throw new TypeError('options.location must be non empty String');
  }

  const locationParts = options.location.split('#');
  const locationFragment = locationParts[1] ? '#' + locationParts[1] : undefined;
  const shouldDecode = decodeURI(options.location) === options.location;

  // Just to be safe, remove any accidental fragment as it would break things
  options.location = combineURIs(options.location, undefined);

  // If the location was not encoded, meke sure it's not when we get it back (Issue #138)
  if (shouldDecode) {
    options.location = decodeURI(options.location);
  }

  // Set the subDocPath to avoid everyone else having to compute it
  options.subDocPath = makeSubDocPath(locationFragment || options.subDocPath);

  options.loader =
    options.loader || (async (location: string) => JSON.parse(await readFile(location, 'utf8')));

  try {
    findValue(obj, options.subDocPath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    error.message = error.message.replace('JSON Pointer', 'options.subDocPath');

    throw error;
  }

  return options as JsonRefsOptions;
}

/**
 * Takes an array of path segments and decodes the JSON Pointer tokens in them.
 *
 * @param path - The array of path segments
 *
 * @returns the array of path segments with their JSON Pointer tokens decoded
 *
 * @throws if the path is not an `Array`
 *
 * @see {@link https://tools.ietf.org/html/rfc6901#section-3}
 */
function decodePath(path: string[]) {
  return path.map((seg) => {
    if (!isString(seg)) {
      seg = JSON.stringify(seg);
    }

    return seg.replace(/~1/g, '/').replace(/~0/g, '~');
  });
}

/**
 * Takes an array of path segments and encodes the special JSON Pointer characters in them.
 *
 * @param path - the array of path segments
 *
 * @returns the array of path segments with their JSON Pointer tokens encoded
 *
 * @throws if the path is not an `Array`
 *
 * @see {@link https://tools.ietf.org/html/rfc6901#section-3}
 */
function encodePath(path: string[]) {
  return path.map((seg) => {
    if (!isString(seg)) {
      seg = JSON.stringify(seg);
    }

    return seg.replace(/~/g, '~0').replace(/\//g, '~1');
  });
}

/**
 * Returns detailed information about the JSON Reference.
 *
 * @param def - The JSON Reference definition
 * @param location - The JSON Reference definition source path
 *
 * @returns the detailed information
 */
function getRefDetails(def: RefDefinition, location: string): UnresolvedRefDetails {
  const details: Partial<UnresolvedRefDetails> = {
    def,
    location,
  };

  try {
    if (!isObject(def)) {
      throw new Error('obj is not an Object');
    } else if (!isString(def.$ref)) {
      throw new Error('obj.$ref is not a String');
    }

    const uriDetails = parseURI(def.$ref);

    details.uri = def.$ref;
    details.uriDetails = uriDetails;

    if (uriDetails.error) {
      throw new Error(uriDetails.error);
    }

    details.type = refType(details as UnresolvedRefDetails);

    // Validate the JSON Pointer
    if (['#', '/'].indexOf(def.$ref[0]) > -1) {
      isPtr(def.$ref);
    } else if (def.$ref.indexOf('#') > -1) {
      isPtr(uriDetails.fragment);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    details.error = error.message;
    details.type = 'invalid';
  }

  return details as UnresolvedRefDetails;
}

/**
 * Returns whether the argument represents a JSON Pointer.
 *
 * A string is a JSON Pointer if the following are all true:
 *
 *   * The string is of type `String`
 *   * The string must be empty, `#` or start with a `/` or `#/`
 *
 * @param ptr - The string to check
 *
 * @returns the result of the check
 *
 * @throws when the provided value is invalid and the `throwWithDetails` argument is `true`
 *
 * @see {@link https://tools.ietf.org/html/rfc6901#section-3}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPtr(ptr: any) {
  if (!isString(ptr)) {
    throw new Error('ptr is not a String');
  }

  if (!ptr) {
    return;
  }

  if (!ptr.match(/^#?\/|^#$/)) {
    throw new Error('ptr must start with a / or #/');
  } else if (ptr.match(/~(?:[^01]|$)/g)) {
    throw new Error('ptr has invalid token(s)');
  }
}

/**
 * Returns an array of path segments for the provided JSON Pointer.
 *
 * @param ptr - The JSON Pointer
 *
 * @returns the path segments
 *
 * @throws if the provided `ptr` argument is not a JSON Pointer
 */
function pathFromPtr(ptr: string): string[] {
  try {
    isPtr(ptr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error('ptr must be a JSON Pointer: ' + error.message);
  }

  const segments = ptr.split('/');

  // Remove the first segment
  segments.shift();

  return decodePath(segments);
}

/**
 * Returns a JSON Pointer for the provided array of path segments.
 *
 * **Note:** If a path segment in `path` is not a `String`, it will be converted to one using `JSON.stringify`.
 *
 * @param path - The array of path segments
 * @param [hashPrefix=true] - Whether or not create a hash-prefixed JSON Pointer
 *
 * @returns the corresponding JSON Pointer
 *
 * @throws if the `path` argument is not an array
 */
function pathToPtr(path: string[], hashPrefix?: boolean): string {
  if (!Array.isArray(path)) {
    throw new Error('path must be an Array');
  }

  // Encode each segment and return
  return (
    (hashPrefix === false ? '' : '#') + (path.length > 0 ? '/' : '') + encodePath(path).join('/')
  );
}

/**
 * Finds JSON References defined within the provided array/object.
 *
 * @param obj - The structure to find JSON References within
 * @param options - The JsonRefs options
 *
 * @returns an object whose keys are JSON Pointers
 * *(fragment version)* to where the JSON Reference is defined and whose values are {@link UnresolvedRefDetails}.
 *
 * @throws when the input arguments fail validation or if `options.subDocPath` points to an invalid location
 */
function findRefs(obj: JSONObject, options: JsonRefsOptions) {
  options = validateOptions(options, obj);

  const refs: Hash<UnresolvedRefDetails> = {};
  const ancestors = findAncestors(obj, options.subDocPath);
  const value = findValue(obj, options.subDocPath);
  const path = options.subDocPath.slice();

  // Walk the document (or sub document) and find all JSON References
  walk(ancestors, value, path, (node, path) => {
    if (!isRefLike(node)) {
      return true;
    }

    const refDetails = getRefDetails(node, options.location);
    const refPtr = pathToPtr(path);

    if (typeof options.onRef === 'function') {
      options.onRef(refDetails, path);
    }

    refs[refPtr] = refDetails;

    return false;
  });

  return refs;
}

function refdId(refDetails: ResolvedRefDetails) {
  const relativeBase = dirname(refDetails.location);
  const refPath = isRemoteRef(refDetails)
    ? combineURIs(relativeBase, refDetails.uri)
    : refDetails.location;
  const refFragment = '#' + (refDetails.uriDetails.fragment || '');

  return decodeURI(makeAbsolute(refPath) + refFragment);
}

async function buildRefModel(
  document: JSONObject,
  options: JsonRefsOptions,
  metadata: RefModelMetadata,
) {
  const subDocPtr = pathToPtr(options.subDocPath);
  const absLocation = makeAbsolute(options.location);
  const docDepKey = absLocation + subDocPtr;

  // Store the document in the metadata if necessary
  if (!metadata.docs[absLocation]) {
    metadata.docs[absLocation] = document;
  }

  // If there are no dependencies stored for the location+subDocPath, we've never seen it before and will process it
  if (!metadata.deps[docDepKey]) {
    metadata.deps[docDepKey] = {};

    const refs = findRefs(document, options);

    for (const [refPtr, refDetails] of Object.entries<ResolvedRefDetails>(
      refs as Hash<ResolvedRefDetails>,
    )) {
      // Do not process invalid references
      if (!isValidRef(refDetails)) {
        continue;
      }

      const refKey = makeAbsolute(options.location) + refPtr;
      const refShortPtr = refPtr === subDocPtr ? '#' : refPtr.replace(subDocPtr + '/', '#/');
      const refdKey = refdId(refDetails);

      // Do not process directly-circular references (to an ancestor or self)
      if (refKey.indexOf(refdKey + '/') === 0 || refKey === refdKey) {
        continue;
      }

      // Record reference metadata
      metadata.refs[refKey] = refDetails;

      // Record the fully-qualified URI
      refDetails.fqURI = refdKey;

      // Record dependency (relative to the document's sub-document path)
      metadata.deps[docDepKey][refShortPtr] = refdKey;

      try {
        const subDocPath = makeSubDocPath(refDetails.uriDetails.fragment);

        // Resolve the reference
        if (isRemoteRef(refDetails)) {
          const location = refdKey.split('#')[0];
          const absLocation = makeAbsolute(location);

          if (!metadata.docs[absLocation]) {
            metadata.docs[absLocation] = await options.loader(decodeURI(absLocation));
          }

          await buildRefModel(
            metadata.docs[absLocation],
            {
              ...options,
              // The new location being referenced
              location,
              subDocPath,
            },
            metadata,
          );
        } else {
          await buildRefModel(
            document,
            {
              ...options,
              subDocPath,
            },
            metadata,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        markMissing(refDetails, error);
      }
    }
  }

  return metadata;
}

/**
 * Finds JSON References defined within the provided array/object and resolves them.
 *
 * @param obj - The structure to find JSON References within
 * @param options - The JsonRefs options
 *
 * @returns a promise that resolves a refs map and rejects with an `Error` when the input arguments fail validation,
 * when `options.subDocPath` points to an invalid location or when the location argument points to an unloadable
 * resource
 *
 * @example
 * // Example that only resolves relative and remote references
 * JsonRefs.resolveRefs(swaggerObj, {
 *     location: 'file/location'
 * }).then(function (res) {
 *      // Do something with the response
 *      //
 *      // res.refs: JSON Reference locations and details
 *      // res.resolved: The document with the appropriate JSON References resolved
 * }, function (err) {
 *     console.log(err.stack);
 * });
 */
export async function resolveRefs(obj: JSONObject, options: ExternalJsonRefsOptions) {
  options = validateOptions(options as JsonRefsOptions, obj);

  return _resolveRefs(obj, options as JsonRefsOptions);
}

async function _resolveRefs(obj: JSONObject, options: JsonRefsOptions) {
  const results: RefModelMetadata = {
    deps: {}, // To avoid processing the same refernece twice, and for circular reference identification
    docs: {}, // Cache to avoid processing the same document more than once
    refs: {}, // Reference locations and their metadata
  };

  await buildRefModel(obj, options, results);

  const allRefs: Hash<ResolvedRefDetails> = {};
  const depGraph = new Graph();
  const fullLocation = makeAbsolute(options.location);
  const refsRoot = fullLocation + pathToPtr(options.subDocPath);
  const relativeBase = dirname(fullLocation);

  // Identify circulars

  // Add nodes first
  Object.keys(results.deps).forEach((node) => {
    depGraph.setNode(node);
  });

  // Add edges
  forOwn(results.deps, (props, node) => {
    forOwn(props, (dep) => {
      depGraph.setEdge(node, dep);
    });
  });

  const circularPaths: string[][] = alg.findCycles(depGraph);
  const circulars: string[] = [];

  // Create a unique list of circulars
  circularPaths.forEach((path: string[]) => {
    path.forEach((seg) => {
      if (circulars.indexOf(seg) === -1) {
        circulars.push(seg);
      }
    });
  });

  // Identify circulars
  forOwn(results.deps, (props, node) => {
    forOwn(props, (dep, prop) => {
      if (circulars.indexOf(dep) === -1) {
        return;
      }

      const refPtr = node + prop.slice(1);
      const refDetails = results.refs[node + prop.slice(1)];
      const remote = isRemoteRef(refDetails);

      // Figure out if the circular is part of a circular chain or just a reference to a circular
      refDetails.circular = circularPaths.some((path) => {
        const pathIndex = path.indexOf(dep);

        if (pathIndex === -1) {
          return false;
        }

        // Check each path segment to see if the reference location is beneath one of its segments
        return path.some((seg) => {
          if (refPtr.indexOf(seg + '/') === 0) {
            // If the reference is local, mark it as circular but if it's a remote reference, only mark it
            // circular if the matching path is the last path segment or its match is not to a document root
            if (!remote || pathIndex === path.length - 1 || dep[dep.length - 1] !== '#') {
              return true;
            }
          }

          return false;
        });
      });
    });
  });

  function walkRefs(root: string, refPtr: string, refPath: string[]) {
    const refPtrParts = refPtr.split('#');
    const refDetails = results.refs[refPtr];

    // Record the reference (relative to the root document unless the reference is in the root document)
    allRefs[
      refPtrParts[0] === options.location
        ? '#' + refPtrParts[1]
        : pathToPtr(options.subDocPath.concat(refPath))
    ] = refDetails;

    if (refDetails.circular) {
      return;
    }

    // Do not walk invalid references
    if (!isValidRef(refDetails)) {
      // Sanitize errors
      if (refDetails.error) {
        // The way we use findRefs now results in an error that doesn't match the expectation
        refDetails.error = refDetails.error.replace('options.subDocPath', 'JSON Pointer');

        // Update the error to use the appropriate JSON Pointer
        if (refDetails.error.indexOf('#') > -1) {
          refDetails.error = refDetails.error.replace(
            refDetails.uri.substr(refDetails.uri.indexOf('#')),
            refDetails.uri,
          );
        }

        // Report errors opening files as JSON Pointer errors
        if (
          refDetails.error.indexOf('ENOENT:') === 0 ||
          refDetails.error.indexOf('Not Found') === 0
        ) {
          refDetails.error = 'JSON Pointer points to missing location: ' + refDetails.uri;
        }
      }

      return;
    }

    const refdKey = refdId(refDetails);
    const refDeps = results.deps[refdKey];

    if (refdKey.indexOf(root) !== 0) {
      Object.keys(refDeps).forEach((prop) => {
        walkRefs(refdKey, refdKey + prop.substr(1), refPath.concat(pathFromPtr(prop)));
      });
    }
  }

  // For performance reasons, we only process a document (or sub document) and each reference once ever.  This means
  // that if we want to provide the full picture as to what paths in the resolved document were created as a result
  // of a reference, we have to take our fully-qualified reference locations and expand them to be all local based
  // on the original document.
  forOwn(results.refs, (refDetails, refPtr) => {
    // Make all fully-qualified reference URIs relative to the document root (if necessary).  This step is done here
    // for performance reasons instead of below when the official sanitization process runs.
    if (refDetails.type !== 'invalid') {
      // Remove the trailing hash from document root references if they weren't in the original URI
      if (
        refDetails.fqURI[refDetails.fqURI.length - 1] === '#' &&
        refDetails.uri[refDetails.uri.length - 1] !== '#'
      ) {
        refDetails.fqURI = refDetails.fqURI.substr(0, refDetails.fqURI.length - 1);
      }

      const fqURISegments = refDetails.fqURI.split('/');
      const uriSegments = refDetails.uri.split('/');

      // The fully-qualified URI is unencoded so to keep the original formatting of the URI (encoded vs. unencoded),
      // we need to replace each URI segment in reverse order.
      times(uriSegments.length - 1, (time) => {
        const nSeg = uriSegments[uriSegments.length - time - 1];
        const pSeg = uriSegments[uriSegments.length - time];
        const fqSegIndex = fqURISegments.length - time - 1;

        if (nSeg === '.' || nSeg === '..' || pSeg === '..') {
          return;
        }

        fqURISegments[fqSegIndex] = nSeg;
      });

      refDetails.fqURI = fqURISegments.join('/');

      // Make the fully-qualified URIs relative to the document root
      if (refDetails.fqURI.indexOf(fullLocation) === 0) {
        refDetails.fqURI = refDetails.fqURI.replace(fullLocation, '');
      } else if (refDetails.fqURI.indexOf(relativeBase) === 0) {
        refDetails.fqURI = refDetails.fqURI.replace(relativeBase, '');
      }

      if (refDetails.fqURI[0] === '/') {
        refDetails.fqURI = '.' + refDetails.fqURI;
      }
    }

    // We only want to process references found at or beneath the provided document and sub-document path
    if (refPtr.indexOf(refsRoot) !== 0) {
      return;
    }

    walkRefs(refsRoot, refPtr, pathFromPtr(refPtr.substr(refsRoot.length)));
  });

  // Sanitize the reference details
  forOwn(allRefs, (refDetails) => {
    // To avoid the error message being URI encoded/decoded by mistake, replace the current JSON Pointer with the
    // value in the JSON Reference definition.
    if (refDetails.missing && refDetails.error) {
      refDetails.error = refDetails.error.split(': ')[0] + ': ' + refDetails.def.$ref;
    }
  });

  return allRefs;
}
