import type {Ref} from './refs/proxy';

export type JSONData<T = unknown> =
  | string
  | number
  | boolean
  | JSONData<T>[]
  | ({
      [prop: string]: JSONData<T>;
    } & T);

export type JSONObject<T = unknown> = {
  [prop: string]: JSONData<T>;
};

export interface RefDefinition {
  $ref: string;
}

export type RefLink = {
  [Ref]: RefDefinition;
};

export type LinkedJSONObject = JSONObject<RefLink>;

export type FileLoader = (path: string) => Promise<JSONObject>;
