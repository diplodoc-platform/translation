import {XMLBuilder} from 'fast-xml-parser';

const options = {format: true, ignoreAttributes: false};
const builder = new XMLBuilder(options);

export type TransUnitParameters = {
    indentation?: number;
    target?: string;
    source?: string;
    id: number;
};

export type TransUnitData = {
    'trans-unit': {
        source?: XLFHasText;
        target?: XLFHasText;
    } & XLFHasID;
};

export type XLFHasText = {
    '#text'?: string;
};

export type XLFHasID = {
    '@_id'?: number;
};

function generate({source, target, id, indentation = 0}: TransUnitParameters) {
    const data: TransUnitData = {
        'trans-unit': {
            '@_id': id,
        },
    };

    if (source?.length) {
        data['trans-unit'].source = {
            '#text': source,
        };
    }

    if (target?.length) {
        data['trans-unit'].target = {
            '#text': target,
        };
    }

    return builder
        .build(data)
        .split('\n')
        .filter(Boolean)
        .map((s: string) => ' '.repeat(indentation + 2) + s)
        .join('\n');
}

export {generate};
export default {generate};
