import {parseTranslations} from './parser';
import {template, transUnit} from './generator';

const templateParameters = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

const {
    template: [before, after],
    indentation,
} = template.generate(templateParameters);

const transUnits = [
    {source: 'Sentence about something', target: 'Предложение о чем-то', id: 0, indentation},
    {source: 'Text fragment', target: 'Фрагмент Текста', id: 1, indentation},
];

const transUnitWithAttributes = (id: number, text: string) => `\
<trans-unit id="${id}">
    <source>source</source>
    <target xml:lang="en-US">${text}</target>
</trans-unit>`;

const xlf = before + transUnits.map(transUnit.generate).join('') + after;

describe('smoke', () => {
    it('works', () => {
        parseTranslations({xlf});
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        parseTranslations({xlf});
    });

    it('throws on invalid parameters', () => {
        const invalidXLF = before + '</kek>' + after;

        expect(() => parseTranslations({xlf: ''})).toThrow();
        expect(() => parseTranslations({xlf: invalidXLF})).toThrow();
    });
});

describe('parses translation units', () => {
    it('parses targets', () => {
        const translations = parseTranslations({xlf, startID: 0});

        for (const expected of transUnits) {
            const translation = translations.get(String(expected.id));
            if (!translation) {
                throw new Error(`failed to receive ${expected} translation unit`);
            }

            expect(translation).toStrictEqual(expected.target);
        }
    });

    it('parses trans-units', () => {
        const [open, close] = template.generate(templateParameters).template;

        const fixtures: Array<[number, string]> = [
            [1, 'text segment 1'],
            [2, 'text segment 2'],
        ];

        const document =
            open + fixtures.map((fixture) => transUnitWithAttributes(...fixture)) + close;

        const translations = parseTranslations({xlf: document});

        for (const [id, text] of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(text);
        }
    });

    it('parses single trans-unit', () => {
        const [open, close] = template.generate(templateParameters).template;

        const fixtures: Array<[number, string]> = [[1, 'text segment 1']];

        const document =
            open + fixtures.map((fixture) => transUnitWithAttributes(...fixture)) + close;

        const translations = parseTranslations({xlf: document});

        for (const [id, text] of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(text);
        }
    });

    it('parses trans-units sources when trans-unit targets are absent', () => {
        const [open, close] = template.generate(templateParameters).template;

        const fixtures: Array<[number, string]> = [
            [1, 'текст 1'],
            [2, 'текст 2'],
        ];

        const document =
            open +
            `<trans-unit id="${fixtures[0][0]}"><source>${fixtures[0][1]}</source></trans-unit>` +
            `<trans-unit id="${fixtures[1][0]}"><source>${fixtures[1][1]}</source></trans-unit>` +
            close;

        const translations = parseTranslations({xlf: document});
        for (const [id, text] of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(text);
        }
    });
});
