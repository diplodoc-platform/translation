import type {URIComponents} from 'uri-js';

export type JSONData<T = unknown> =
  | string
  | number
  | boolean
  | JSONData<T>[]
  | ({
      [prop: string]: JSONData<T>;
    } & T);

export type JSONObject<T = unknown> = {
  [prop: string]: JSONData<T> & T;
};

export type ExternalJsonRefsOptions = {
  location: JsonRefsOptions['location'];
  loader?: JsonRefsOptions['loader'];
  subDocPath?: JsonRefsOptions['subDocPath'] | string;
  onRef?: JsonRefsOptions['onRef'];
};

/**
 * The options used for various JsonRefs APIs.
 */
export interface JsonRefsOptions {
  /**
   * The location of the document being processed  *(This property is only
   * useful when resolving references as it will be used to locate relative references found within the document being
   * resolved. If this value is relative, {@link https://github.com/whitlockjc/path-loader|path-loader} will use
   * `window.location.href` for the browser and `process.cwd()` for Node.js.)*
   */
  location: string;
  /**
   * The JSON Pointer or array of path segments to the sub document
   * location to search from
   */
  subDocPath: string[];
  /**
   * The options to pass to
   * {@link https://github.com/whitlockjc/path-loader/blob/master/docs/API.md#module_PathLoader.load|PathLoader~load}
   */
  loader: (path: string) => Promise<JSONObject>;

  /**
   * The callback used to post-process the JSON Reference
   * metadata *(This is called prior filtering the references)*
   */
  onRef?: (details: UnresolvedRefDetails, path: string[]) => void;
}

export interface RefDefinition {
  $ref: string;
}

/**
 * Detailed information about unresolved JSON References.
 */
export interface UnresolvedRefDetails {
  /**
   * The JSON Reference definition
   */
  def: RefDefinition;
  /**
   * The JSON Reference definition source path
   */
  location: string;
  /**
   * The error information for invalid JSON Reference definition *(Only present when the
   * JSON Reference definition is invalid or there was a problem retrieving a remote reference during resolution)*
   */
  error?: string;
  /**
   * The URI portion of the JSON Reference
   */
  uri: string;
  /**
   * Detailed information about the URI as provided by
   * {@link https://github.com/garycourt/uri-js|URI.parse}.
   */
  uriDetails: URIComponents;
  /**
   * The JSON Reference type *(This value can be one of the following: `invalid`, `local`,
   * `relative` or `remote`.)*
   */
  type: string;
  /**
   * The warning information *(Only present when the JSON Reference definition produces a
   * warning)*
   */
  warning?: string;
}

/**
 * Detailed information about resolved JSON References.
 */
export interface ResolvedRefDetails extends UnresolvedRefDetails {
  /**
   * Whether or not the JSON Reference is circular *(Will not be set if the JSON
   * Reference is not circular)*
   */
  circular?: boolean;
  /**
   * The fully-qualified version of the `uri` property for
   * {@link UnresolvedRefDetails} but with the value being relative to the root document
   */
  fqURI: string;
  /**
   * Whether or not the referenced value was missing or not *(Will not be set if the
   * referenced value is not missing)*
   */
  missing?: boolean;
  /**
   * The referenced value *(Will not be set if the referenced value is missing)*
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
