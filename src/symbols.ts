import crypto from 'crypto';

const gt = crypto.randomUUID();
const lt = crypto.randomUUID();
const sl = crypto.randomUUID();
const qt = crypto.randomUUID();
// Should start with upper case to force new sentences on segmentation.
const mt = 'A' + crypto.randomUUID() + 'z';

const gtre = new RegExp(`${gt}`, 'gmu');
const ltre = new RegExp(`${lt}`, 'gmu');
const qtre = new RegExp(`${qt}`, 'gmu');
const slre = new RegExp(`${sl}`, 'gmu');
const mtre = new RegExp(`${mt}`, 'gmu');

function unescapeSymbols(str: string): string {
  return str
    .replace(gtre, '>')
    .replace(ltre, '<')
    .replace(qtre, '"')
    .replace(slre, '/')
    .replace(mtre, '');
}

export {lt, gt, sl, qt, mt, gtre, ltre, qtre, slre, mtre, unescapeSymbols};
