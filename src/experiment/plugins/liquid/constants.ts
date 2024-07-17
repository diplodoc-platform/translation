export enum FragmentType {
    Variable = 'variable',
    Operator = 'operator',
}

export const VARS_RE = /{{2}([. \w-|(),]+)}{2}/;
export const CONDITION_RE = /({%-?([\s\S]*?)-?%})/;
export const INCLUDE_RE = /{%\s*(include)\s*(notitle)?\s*(\[.+?]\(.+?\))\s*%}/;
