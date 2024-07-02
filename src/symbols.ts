import crypto from 'crypto';

const gt = crypto.randomUUID();
const lt = crypto.randomUUID();
const sl = crypto.randomUUID();
const qt = crypto.randomUUID();
// Should start with upper case to force new sentences on segmentation.
const mt = 'E' + crypto.randomUUID() + 'e';
const vr = 'V' + crypto.randomUUID();

const gtre = new RegExp(`${gt}`, 'gmu');
const ltre = new RegExp(`${lt}`, 'gmu');
const qtre = new RegExp(`${qt}`, 'gmu');
const slre = new RegExp(`${sl}`, 'gmu');
const mtre = new RegExp(`${mt}`, 'gmu');
const vrre = new RegExp(`${vr}-\\d+-v`, 'gmu');

function unescapeSymbols(str: string): string {
  return str
    .replace(gtre, '>')
    .replace(ltre, '<')
    .replace(qtre, '"')
    .replace(slre, '/')
    .replace(mtre, '');
}

export {lt, gt, sl, qt, mt, vr, gtre, ltre, qtre, slre, mtre, vrre, unescapeSymbols};
