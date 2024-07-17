export const SKELETON_EXT = '.skl.md';
export const XLIFF_EXT = '.xliff';
export const VARS_EXT = '.vars';
export const MD_EXT = '.md';

export const YamlQuotingTypeQuote = {
  dq: '"' as const,
  sq: "'" as const,
};

export const YamlQuoteQuotingType = {
  '"': 'dq',
  "'": 'sq',
};

export const passSymbols = /^[\s0-9.?*+^/$[\]\\(){}|:,%!@#&='<>`~±§"№_-]*$/;

export const passTranslation = /^[\sa-zA-Z0-9.?*+^/$[\]\\(){}|:,%!@#&=';<>`~±§"№_-]*$/;
