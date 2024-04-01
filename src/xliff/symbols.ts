import crypto from 'crypto';

const gt = crypto.randomUUID();
const lt = crypto.randomUUID();
const sl = crypto.randomUUID();
const qt = crypto.randomUUID();

const gtre = new RegExp(`${gt}`, 'gmu');
const ltre = new RegExp(`${lt}`, 'gmu');
const qtre = new RegExp(`${qt}`, 'gmu');
const slre = new RegExp(`${sl}`, 'gmu');

function unescapeSymbols(str: string): string {
  return str.replace(gtre, '>').replace(ltre, '<').replace(qtre, '"').replace(slre, '/');
}

export {lt, gt, sl, qt, gtre, ltre, qtre, slre, unescapeSymbols};
export default {lt, gt, sl, qt, gtre, ltre, qtre, slre, unescapeSymbols};
