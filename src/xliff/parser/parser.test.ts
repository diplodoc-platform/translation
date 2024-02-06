import {parse} from './index';
import {TransUnitParams, XLF} from 'src/xliff';

const templateParams = {
    source: {language: 'en', locale: 'US' as const},
    target: {language: 'ru', locale: 'RU' as const},
    markdownPath: 'file.md',
    skeletonPath: 'file.skl.md',
};

const generateXLF = (units: TransUnitParams[]) =>
    XLF.generate(templateParams, units.map(XLF.generateTransUnit));

describe('smoke', () => {
    it('works', () => {
        const units = [
            {target: 'Предложение о чем-то', id: 1},
            {target: 'Фрагмент Текста', id: 2},
        ];
        const xliff = generateXLF(units);
        parse({xliff});
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const units = [
            {target: 'Предложение о чем-то', id: 1},
            {target: 'Фрагмент Текста', id: 2},
        ];
        const xliff = generateXLF(units);
        expect(() => parse({xliff})).not.toThrow();
    });

    it('throws on invalid parameters', () => {
        const invalidXLF = XLF.generate(templateParams, ['</kek>']);

        // empty xliff is invalid
        expect(() => parse({xliff: ''})).toThrow();
        // invalid xml is invalid xliff
        expect(() => parse({xliff: invalidXLF})).toThrow();
    });
});

describe('parses translation units', () => {
    it('parses targets', () => {
        const units = [
            {target: 'Предложение о чем-то', id: 1},
            {target: 'Фрагмент Текста', id: 2},
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(2);
        expect(translations).toMatchSnapshot();
    });

    it('parses single trans-unit', () => {
        const units = [{target: 'Предложение о чем-то', id: 1}];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(1);
        expect(translations).toMatchSnapshot();
    });

    it('parses sources when targets are absent with useSource flag enabled', () => {
        const units = [
            {source: 'Предложение о чем-то', id: 1},
            {source: 'Фрагмент Текста', id: 2},
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff, useSource: true});

        expect(translations.length).toStrictEqual(2);
        expect(translations).toMatchSnapshot();
    });
});

describe('parses translation units with <g> and <x> tags', () => {
    it('parses strong wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-strong_open" equiv-text="**" />один<x ctype="x-strong_close" equiv-text="**" />.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-strong_open" equiv-text="**" />два<x ctype="x-strong_close" equiv-text="**" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses em wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-em_open" equiv-text="*" />один<x ctype="x-em_close" equiv-text="*" />.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-em_open" equiv-text="*" />два<x ctype="x-em_close" equiv-text="*" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses s wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-s_open" equiv-text="~~" />один<x ctype="x-s_close" equiv-text="~~" />.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-s_open" equiv-text="~~" />два<x ctype="x-s_close" equiv-text="~~" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses sup wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер<x ctype="x-sup_open" equiv-text="^" />один<x ctype="x-sup_close" equiv-text="^" />.',
            },
            {
                id: 2,
                target: 'Предложение номер<x ctype="x-sup_open" equiv-text="^" />два<x ctype="x-sup_close" equiv-text="^" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses samp wrapped in <g> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-samp_open" equiv-text="##" />один<x ctype="x-samp_close" equiv-text="##" />.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-samp_open" equiv-text="##" />два<x ctype="x-samp_close" equiv-text="##" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses code wrapped in <x> tag', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-code_open" equiv-text="`" />один<x ctype="x-code_close" equiv-text="`" />.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-code_open" equiv-text="`" />два<x ctype="x-code_close" equiv-text="`" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses links wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-link_text_part_open" equiv-text="[" />один<x ctype="x-link_text_part_close" equiv-text="]" /><x ctype="x-link_attributes_part_open" equiv-text="(" /><x ctype="x-link_attributes_href" equiv-text="one.md" /><x ctype="x-link_attributes_title_open" equiv-text="&quot;" />one<x ctype="x-link_attributes_title_close" equiv-text="&quot;" /><x ctype="x-link_attributes_part_close" equiv-text=")" />.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-link_text_part_open" equiv-text="[" />два<x ctype="x-link_text_part_close" equiv-text="]" /><x ctype="x-link_attributes_part_open" equiv-text="(" /><x ctype="x-link_attributes_href" equiv-text="two.md" /><x ctype="x-link_attributes_part_close" equiv-text=")" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses ref links wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-link_reflink" equiv-text="[{#T}]" /><x ctype="x-link_attributes_part_open" equiv-text="(" /><x ctype="x-link_attributes_href" equiv-text="one.md" /><x ctype="x-link_attributes_title_open" equiv-text="&quot;" />one<x ctype="x-link_attributes_title_close" equiv-text="&quot;" /><x ctype="x-link_attributes_part_close" equiv-text=")" />.',
            },
            {
                id: 2,
                target: 'Предложение номер <x ctype="x-link_reflink" equiv-text="[{#T}]" /><x ctype="x-link_attributes_part_open" equiv-text="(" /><x ctype="x-link_attributes_href" equiv-text="two.md" /><x ctype="x-link_attributes_part_close" equiv-text=")" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses autolink wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер один <x ctype="x-link_autolink" equiv-text="&lt;https://www.google.com&gt;" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses variable href link wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Предложение номер <x ctype="x-link_text_part_open" equiv-text="[" />один<x ctype="x-link_text_part_close" equiv-text="]" /><x ctype="x-link_attributes_part_open" equiv-text="(" /><x ctype="x-link_attributes_href" equiv-text="{{one}}" /><x ctype="x-link_attributes_title_open" equiv-text="&quot;" />one<x ctype="x-link_attributes_title_close" equiv-text="&quot;" /><x ctype="x-link_attributes_part_close" equiv-text=")" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses link with multiple sentences inside link text and link title', () => {
        const units = [
            {
                id: 1,
                target: '<x ctype="x-link_text_part_open" equiv-text="[" />Link text sentence one!',
            },
            {
                id: 2,
                target: 'Link text sentence Two?<x ctype="x-link_text_part_close" equiv-text="]" /><x ctype="x-link_attributes_part_open" equiv-text="(" /><x ctype="x-link_attributes_href" equiv-text="file.md" /><x ctype="x-link_attributes_title_open" equiv-text="&quot;" />Link title sentence one.',
            },
            {
                id: 3,
                target: 'Link title sentence two!<x ctype="x-link_attributes_title_close" equiv-text="&quot;" /><x ctype="x-link_attributes_part_close" equiv-text=")" />',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses image with all attributes wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence <x ctype="x-image_text_part_open" equiv-text="![" />image<x ctype="x-image_text_part_close" equiv-text="]" /><x ctype="x-image_attributes_part_open" equiv-text="(" /><x ctype="x-image_attributes_src" equiv-text="image.png" /><x ctype="x-image_attributes_title_open" equiv-text="&quot;" />hint<x ctype="x-image_attributes_title_close" equiv-text="&quot;" /><x ctype="x-image_attributes_size" equiv-text="=100x100" /><x ctype="x-image_attributes_part_close" equiv-text=")" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses video wrapped in x tag', () => {
        const units = [
            {
                id: 1,
                target: 'Another sentence <x ctype="x-video" equiv-text="@[youtube](rJz4OaURJ6U)" />',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});

        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses heading with anchors wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Heading with anchors<x ctype="x-anchor" equiv-text=" {#anchor1}" /><x ctype="x-anchor" equiv-text=" {#anchor2}" />',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses file wrapped <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence with <x ctype="x-file_open" equiv-text="{%" /><x ctype="x-file_src" equiv-text="src=&quot;path/to/file&quot;" /><x ctype="x-file_name_open" equiv-text="name=&quot;" />readme.md<x ctype="x-file_name_close" equiv-text="&quot;" /><x ctype="x-file_referrerpolicy" equiv-text="referrerpolicy=&quot;no-referrer&quot;" /><x ctype="x-file_rel" equiv-text="rel=&quot;noopener&quot;" /><x ctype="x-file_target" equiv-text="target=&quot;_blank&quot;" /><x ctype="x-file_type" equiv-text="type=&quot;text/plain&quot;" /><x ctype="x-file_close" equiv-text="%}" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses liquid conditions wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence with <x ctype="x-liquid_If" equiv-text="{% if var == &quot;val&quot; %}" /> val <x ctype="x-liquid_Else" equiv-text="{% else %}" /> other val <x ctype="x-liquid_EndIf" equiv-text="{% endif %}" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses liquid loop wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence <x ctype="x-liquid_ForInLoop" equiv-text="{% for x in xs %}" /> x <x ctype="x-liquid_EndForInLoop" equiv-text="{% endfor %}" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses liquid function wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence with function <x ctype="x-liquid_Function" equiv-text="{{ user.name.slice(1, 2) }}" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses liquid filters wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence with filter <x ctype="x-liquid_Filter" equiv-text="{{ users | length }}" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses liquid variables wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence with <x ctype="x-liquid_Variable" equiv-text="{{ variable }}" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses inline html wrapped in <x> tags', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence<x ctype="x-html_inline" equiv-text="&lt;br&gt;" />with <x ctype="x-html_inline" equiv-text="&lt;b&gt;" />html<x ctype="x-html_inline" equiv-text="&lt;/b&gt;" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });

    it('parses inline code with liquid wrapped in <x> tag', () => {
        const units = [
            {
                id: 1,
                target: 'Sentence <x ctype="x-code_open" equiv-text="`" /><x ctype="x-liquid_Variable" equiv-text="{{ ui-key.yacloud.common.label_tcp }}" /> other<x ctype="x-code_close" equiv-text="`" />.',
            },
            {
                id: 2,
                target: 'Another sentence <x ctype="x-code_open" equiv-text="`" /><x ctype="x-liquid_Filter" equiv-text="{{user.name | capitalize}}" /> other<x ctype="x-code_close" equiv-text="`" />.',
            },
        ];
        const xliff = generateXLF(units);
        const translations = parse({xliff});
        expect(translations.length).toStrictEqual(units.length);
        expect(translations).toMatchSnapshot();
    });
});
