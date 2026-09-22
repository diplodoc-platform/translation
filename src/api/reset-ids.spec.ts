import {describe, expect, it} from 'vitest';

import {extract} from 'src/api';

const MARKDOWN = [
    'Смотрите [инструкцию](./guide.md) и ![схему](./schema.png).',
    '',
    'Ещё одна ссылка: [пример](./example.md) с `кодом` внутри.',
].join('\n');

const PARAGRAPH = 'Ещё одна ссылка: [пример](./example.md) с `кодом` внутри.';

const OPTIONS = {
    compact: true,
    source: {language: 'ru', locale: 'RU'},
    target: {language: 'en', locale: 'US'},
} as const;

const LOCAL = {...OPTIONS, unitLocalIds: true} as const;

const ids = (text: string) => text.match(/id="[gx]-\d+"/g) ?? [];

describe('extract placeholder ids', () => {
    it('produces identical units for repeated extracts of the same content', () => {
        // Unit texts are used as translation cache and seed keys: a
        // process-global id counter would make the second extract produce
        // different `g-N`/`x-N` ids and silently miss the cache.
        const first = extract(MARKDOWN, OPTIONS);
        const second = extract(MARKDOWN, OPTIONS);

        expect(second.units).toEqual(first.units);
        expect(second.xliff.toString()).toEqual(first.xliff.toString());
    });

    it('restarts the id sequence for every document', () => {
        extract('Другой документ со [ссылкой](./other.md).', OPTIONS);
        const {units} = extract(MARKDOWN, OPTIONS);

        expect(ids(units.join('\n')).length).toBeGreaterThan(0);
        expect(ids(units.join('\n'))).toContain('id="g-1"');
    });

    it('numbers ids through the document by default', () => {
        // The XLIFF handed to external tools keeps document-wide ids: the
        // second unit continues the sequence started by the first one.
        const {units} = extract(MARKDOWN, OPTIONS);

        expect(units).toHaveLength(2);
        expect(ids(units[0])).toContain('id="g-1"');
        expect(ids(units[1])).not.toContain('id="g-1"');
        expect(new Set(ids(units.join('\n'))).size).toBe(ids(units.join('\n')).length);
    });

    it('restarts the id sequence for every unit with unitLocalIds', () => {
        // With document-wide numbering every unit depends on the markup
        // above it: adding one link on top shifts the ids of the whole rest
        // of the file and misses the cache for units that did not change.
        const alone = extract(PARAGRAPH, LOCAL);
        const below = extract(
            ['Вставка со [ссылкой](./new.md) и `кодом`.', '', PARAGRAPH].join('\n'),
            LOCAL,
        );

        expect(below.units).toHaveLength(2);
        expect(below.units[1]).toEqual(alone.units[0]);
    });

    it('keeps ids unique inside a unit with unitLocalIds', () => {
        // Restarting the sequence per unit must not go further: a nested
        // render of the same unit would hand out the same id twice.
        const {units} = extract(MARKDOWN, LOCAL);

        for (const unit of units) {
            expect(ids(unit).length).toBeGreaterThan(1);
            expect(new Set(ids(unit)).size).toBe(ids(unit).length);
        }
    });
});
