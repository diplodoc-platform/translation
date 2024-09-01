import {toXLIFF} from 'src/xliff';

export type Hash = ReturnType<typeof hash>;

type Props = {
    compact?: boolean;
};

export function hash({compact = false}: Props = {}) {
    const segments = new Array<string>();
    const res = function (tokens: Token[]) {
        const unitId = segments.length;
        const xliff = toXLIFF(tokens, unitId, compact);

        segments.push(xliff);

        return '%%%' + unitId + '%%%';
    };

    res.segments = segments;

    return res;
}
