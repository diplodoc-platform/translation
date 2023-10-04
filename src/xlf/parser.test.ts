import {parseTranslations} from './parser';
import {template, transUnit} from './generator';

const templateParameters = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

const {
    template: [open, close],
    indentation,
} = template.generate(templateParameters);

describe('smoke', () => {
    it('works', () => {
        const fixtures = [
            {
                source: 'Sentence about something',
                target: 'Предложение о чем-то',
                id: 0,
                indentation,
            },
            {source: 'Text fragment', target: 'Фрагмент Текста', id: 1, indentation},
        ];

        const xlf = open + fixtures.map((fixture) => transUnit.generate(fixture)) + close;

        parseTranslations({xlf});
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const fixtures = [
            {
                source: 'Sentence about something',
                target: 'Предложение о чем-то',
                id: 0,
                indentation,
            },
            {source: 'Text fragment', target: 'Фрагмент Текста', id: 1, indentation},
        ];

        const xlf = open + fixtures.map((fixture) => transUnit.generate(fixture)) + close;

        parseTranslations({xlf});
    });

    it('throws on invalid parameters', () => {
        const invalidXLF = open + '</kek>' + close;

        expect(() => parseTranslations({xlf: ''})).toThrow();
        expect(() => parseTranslations({xlf: invalidXLF})).toThrow();
    });
});

describe('parses translation units', () => {
    it('parses targets', () => {
        const fixtures = [
            {
                source: 'Sentence about something',
                target: 'Предложение о чем-то',
                id: 0,
                indentation,
            },
            {source: 'Text fragment', target: 'Фрагмент Текста', id: 1, indentation},
        ];

        const xlf = open + fixtures.map((fixture) => transUnit.generate(fixture)) + close;
        const translations = parseTranslations({xlf, startID: 0});

        for (const {id, target} of fixtures) {
            const translation = translations.get(String(id));
            if (!translation) {
                throw new Error(`failed to receive ${target} translation unit`);
            }

            expect(translation).toStrictEqual(target);
        }
    });

    it('parses trans-units', () => {
        const fixtures = [
            {id: 1, target: 'text segment 1', targetLangLocale: 'en-US'},
            {id: 2, target: 'text segment 2', targetLangLocale: 'en-US'},
        ];

        const document = open + fixtures.map((fixture) => transUnit.generate(fixture)) + close;

        const translations = parseTranslations({xlf: document});

        for (const {id, target} of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(target);
        }
    });

    it('parses single trans-unit', () => {
        const fixtures = [{id: 1, target: 'text segment 1', targetLangLocale: 'en-US'}];

        const document = open + fixtures.map((fixture) => transUnit.generate(fixture)) + close;

        const translations = parseTranslations({xlf: document});

        for (const {id, target} of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(target);
        }
    });

    it('parses trans-units sources when trans-unit targets are absent', () => {
        const fixtures: Array<[number, string]> = [
            [1, 'текст 1'],
            [2, 'текст 2'],
        ];

        const document =
            open +
            `<trans-unit id="${fixtures[0][0]}"><source>${fixtures[0][1]}</source></trans-unit>` +
            `<trans-unit id="${fixtures[1][0]}"><source>${fixtures[1][1]}</source></trans-unit>` +
            close;

        const translations = parseTranslations({xlf: document, useSource: true});
        for (const [id, text] of fixtures) {
            const translation = translations.get(String(id));

            if (!translation) {
                throw new Error(`failed to receive ${id} translation unit`);
            }

            expect(translation).toStrictEqual(text);
        }
    });

    it('parses trans-units targets with links as g and x tags', () => {
        const fixture = {
            id: 1,
            target: `Sentence with <g ctype="x-[-]">link</g><g ctype="x-(-)"><x ctype="x-link-href" equiv-text="file.md" /><g ctype="x-&quot-&quot">title</g></g>.`,
        };
        const expected = 'Sentence with [link](file.md "title").';
        const document = open + transUnit.generate(fixture) + close;
        const translations = parseTranslations({xlf: document});
        expect(translations.get(String(1))).toStrictEqual(expected);
    });

    it('parses trans-units targets with bold as g tags', () => {
        const fixture = {
            id: 1,
            target: `Предложение номер <g ctype="x-**-**">один</g>.`,
        };
        const expected = 'Предложение номер **один**.';
        const document = open + transUnit.generate(fixture) + close;
        const translations = parseTranslations({xlf: document});
        expect(translations.get(String(1))).toStrictEqual(expected);
    });

    it('parses trans-units targets with italics as g tags', () => {
        const fixture = {
            id: 1,
            target: `Предложение номер <g ctype="x-*-*">один</g>.`,
        };
        const expected = 'Предложение номер *один*.';
        const document = open + transUnit.generate(fixture) + close;
        const translations = parseTranslations({xlf: document});
        expect(translations.get(String(1))).toStrictEqual(expected);
    });

    it('parses trans-units targets with strikethrough as g tags', () => {
        const fixture = {
            id: 1,
            target: `Предложение номер <g ctype="x-~~-~~">один</g>.`,
        };
        const expected = 'Предложение номер ~~один~~.';
        const document = open + transUnit.generate(fixture) + close;
        const translations = parseTranslations({xlf: document});
        expect(translations.get(String(1))).toStrictEqual(expected);
    });

    it('parses trans-units targets with superscript as g tags', () => {
        const fixture = {
            id: 1,
            target: `Предложение номер <g ctype="x-^-^">один</g>.`,
        };
        const expected = 'Предложение номер ^один^.';
        const document = open + transUnit.generate(fixture) + close;
        const translations = parseTranslations({xlf: document});
        expect(translations.get(String(1))).toStrictEqual(expected);
    });

    it('parses trans-units targets with monospace as g tags', () => {
        const fixture = {
            id: 1,
            target: `Предложение номер <g ctype="x-##-##">один</g>.`,
        };
        const expected = 'Предложение номер ##один##.';
        const document = open + transUnit.generate(fixture) + close;
        const translations = parseTranslations({xlf: document});
        expect(translations.get(String(1))).toStrictEqual(expected);
    });

    it('parses trans-units targets with inline code as g tags', () => {
        const fixture = {
            id: 1,
            target: 'Предложение номер <g ctype="x-`-`">один</g>.',
        };
        const expected = 'Предложение номер `один`.';
        const document = open + transUnit.generate(fixture) + close;
        const translations = parseTranslations({xlf: document});
        expect(translations.get(String(1))).toStrictEqual(expected);
    });
});
