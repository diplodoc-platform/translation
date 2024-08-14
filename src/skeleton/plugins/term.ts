import type MdIt from 'markdown-it';

import {termDefinitions} from '@diplodoc/transform/lib/plugins/term/termDefinitions';

export default function (md: MdIt) {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    md.block.ruler.before('reference', 'termDefinitions', termDefinitions(md, {} as any), {
        alt: ['paragraph', 'reference'],
    });
}
