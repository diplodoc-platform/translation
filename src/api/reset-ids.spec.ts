import {afterEach, beforeEach, describe, expect, it} from 'vitest';

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
    // The JEST_WORKER_ID short-circuit replaces real ids with a constant,
    // hiding the numbering from tests - disable it for this suite.
    let jestWorkerId: string | undefined;

    beforeEach(() => {
        jestWorkerId = process.env.JEST_WORKER_ID;
        delete process.env.JEST_WORKER_ID;
    });

    afterEach(() => {
        if (jestWorkerId !== undefined) {
            process.env.JEST_WORKER_ID = jestWorkerId;
        }
    });

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
});
