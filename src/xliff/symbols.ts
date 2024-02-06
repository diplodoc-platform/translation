import crypto from 'crypto';

const gt = crypto.randomUUID();
const lt = crypto.randomUUID();
const sl = crypto.randomUUID();
const qt = crypto.randomUUID();

// eslint-disable-next-line security/detect-non-literal-regexp
const gtre = new RegExp(`${gt}`, 'gmu');
// eslint-disable-next-line security/detect-non-literal-regexp
const ltre = new RegExp(`${lt}`, 'gmu');
// eslint-disable-next-line security/detect-non-literal-regexp
const qtre = new RegExp(`${qt}`, 'gmu');
// eslint-disable-next-line security/detect-non-literal-regexp
const slre = new RegExp(`${sl}`, 'gmu');

function unescapeSymbols(str: string): string {
    return str.replace(gtre, '>').replace(ltre, '<').replace(qtre, '"').replace(slre, '/');
}

export {lt, gt, sl, qt, gtre, ltre, qtre, slre, unescapeSymbols};
export default {lt, gt, sl, qt, gtre, ltre, qtre, slre, unescapeSymbols};
