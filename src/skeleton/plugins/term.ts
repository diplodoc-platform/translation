import type MdIt from 'markdown-it';
import {termDefinitions} from '@diplodoc/transform/lib/plugins/term/termDefinitions';

export default function (md: MdIt) {
  md.block.ruler.before('reference', 'termDefinitions', termDefinitions(md, {} as any), {
    alt: ['paragraph', 'reference'],
  });
}
