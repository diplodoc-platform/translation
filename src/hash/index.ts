import {toXLIFF} from 'src/xliff';

export type Hash = ReturnType<typeof hash>;

export type IdOptions = {
    /**
     * Restart placeholder ids (`g-N`/`x-N`) for every unit instead of
     * numbering them through the document.
     *
     * Unit texts are used as translation cache keys; with document-wide
     * numbering a unit's text depends on the markup extracted above it,
     * so adding one link at the top of a file changes every unit below.
     * Off by default: the XLIFF handed to external tools keeps its
     * document-wide ids.
     */
    unitLocalIds?: boolean;
};

type Props = IdOptions & {
    compact?: boolean;
};

export function hash({compact = false, unitLocalIds = false}: Props = {}) {
    const segments = new Array<string>();
    const res = function (tokens: Token[]) {
        const unitId = segments.length;
        const xliff = toXLIFF(tokens, unitId, compact, unitLocalIds);

        segments.push(xliff);

        return '%%%' + unitId + '%%%';
    };

    res.segments = segments;

    return res;
}
