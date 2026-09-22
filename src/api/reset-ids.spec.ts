import {describe, expect, it} from 'vitest';

import {extract} from 'src/api';

const MARKDOWN = [
    'Смотрите [инструкцию](./guide.md) и ![схему](./schema.png).',
    '',
    'Ещё одна ссылка: [пример](./example.md) с `кодом` внутри.',
].join('\n');

const OPTIONS = {
    compact: true,
    source: {language: 'ru', locale: 'RU'},
    target: {language: 'en', locale: 'US'},
} as const;

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

        const ids = units.join('\n').match(/id="[gx]-\d+"/g) ?? [];
        expect(ids.length).toBeGreaterThan(0);
        expect(ids).toContain('id="g-1"');
    });

    it('restarts the id sequence for every unit', () => {
        // Ids are part of the unit text, so numbering them through the
        // document makes every unit depend on the markup above it: adding
        // one link on top shifts the ids of the whole rest of the file and
        // misses the cache for units that did not change.
        const paragraph = 'Ещё одна ссылка: [пример](./example.md) с `кодом` внутри.';

        const alone = extract(paragraph, OPTIONS);
        const below = extract(
            ['Вставка со [ссылкой](./new.md) и `кодом`.', '', paragraph].join('\n'),
            OPTIONS,
        );

        expect(below.units).toHaveLength(2);
        expect(below.units[1]).toEqual(alone.units[0]);
    });

    it('keeps ids unique inside a unit', () => {
        // Restarting the sequence per unit must not go further: a nested
        // render of the same unit would hand out the same id twice.
        const {units} = extract(MARKDOWN, OPTIONS);

        for (const unit of units) {
            const ids = unit.match(/id="[^"]+"/g) ?? [];

            expect(ids.length).toBeGreaterThan(1);
            expect(new Set(ids).size).toBe(ids.length);
        }
    });
});
