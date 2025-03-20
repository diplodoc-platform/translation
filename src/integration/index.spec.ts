/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-irregular-whitespace */

import {dedent} from 'ts-dedent';

import {compose, extract} from 'src/api';

const test = (() => {
    function test(name: string, call?: 'skip' | 'only') {
        return function (parts: TemplateStringsArray, ...vars: string[]) {
            describe('integration', () => {
                const caller = call ? it[call] : it;
                const markdown = vars.length ? dedent(parts, vars) : dedent(parts);

                function main() {
                    const {xliff, skeleton, units} = extract(markdown, {
                        compact: false,
                        source: {
                            language: 'ru',
                            locale: 'RU',
                        },
                        target: {
                            language: 'en',
                            locale: 'US',
                        },
                    });

                    if (!units.length) {
                        return [xliff, skeleton];
                    }

                    const result = compose(skeleton, xliff, {useSource: true});

                    expect(result).toEqual(markdown);

                    return [xliff, skeleton, result];
                }

                function expr() {
                    const {xliff, skeleton} = extract(markdown, {
                        compact: false,
                        originalFile: 'file.ext',
                        skeletonFile: 'file.skl',
                        source: {
                            language: 'ru',
                            locale: 'RU',
                        },
                        target: {
                            language: 'en',
                            locale: 'US',
                        },
                        useExperimentalParser: true,
                    });

                    const xliffString = xliff.toString();

                    if (!xliff.transUnits.length) {
                        return [xliff, skeleton];
                    }

                    const {document} = compose(skeleton, xliffString, {
                        useSource: true,
                        useExperimentalParser: true,
                    });

                    expect(document).toEqual(markdown);

                    return [xliff.toString(), skeleton, document];
                }

                caller(name, () => {
                    const [xliff1, skeleton1] = main();
                    const [xliff2, skeleton2] = expr();

                    expect(xliff1).toMatchSnapshot('xliff main');
                    expect(xliff2).toMatchSnapshot('xliff expr');
                    expect(skeleton1).toMatchSnapshot('skeleton main');
                    expect(skeleton2).toMatchSnapshot('skeleton expr');
                });
            });
        };
    }

    test.skip = (name: string) => test(name, 'skip');
    test.only = (name: string) => test(name, 'only');

    return test;
})();

test('link variable leak')`
    ## Request
    
    #||| **method** | **url** ||
    
    ||
    \`\`\`
    POST
    \`\`\`
    | 
    \`\`\`
    https://api.example.ru/businesses/{businessId}/offer-mappings/update
    \`\`\`
    |||#
    
    ### Path parameters
    
    #||| **Name** | **Type** | **Description** ||
    
    || businessId | integer&lt;int64&gt; | Description |||#
`;

test('recursive merge tokens')`
    Sentense [link](file.md "title").
`;

test('handles inline code 1')`
    Параметр | Описание
    ----- | -----
    \`InternalServerError\` | Произошла
`;

// test.skip('handles inline code 2')`
//     The \`Success! The configuration is valid\`
// `;

test('handles inline code 3')`
    Описание значений полей:
    | **Название поля** | **Тип** | **Описание** |
    | --- | --- | --- |
    |column_name|\`string\`<br>\`required\`|Имя колонки для TTL|
`;

test('computes valid sentenses')`
    Записывает или удаляет элементы из таблиц.
    Один вызов может записать до 16 Мб данных, что может включать до 25 запросов на размещение или удаление. Каждый элемент может иметь размер до 400 Кб.
`;

test('handles titleless notes')`
    {% note info %}

    Для работы в режиме совместимости с Amazon DynamoDB используйте бессерверную (Serverless) конфигурацию БД.
    
    {% endnote %}
`;

test('handles blockquotes')`
    > 1
    > 2
    >
    > > 3
    > > 4
    >
    > 5
`;

test('handles multiline inline code')`
    \`ALL_CONCAT( expression [ , separator ]
        [ FIXED ... | INCLUDE ... | EXCLUDE ... ]
        [ BEFORE FILTER BY ... ]
    )\`
`;

test('handles code regexps with escape chars')`
    Поле | Описание
    --- | ---
    zone |  \`\`[.]\\|[a-z0-9][-a-z0-9.]*\\.\`\`
`;

test('handles links in brackets')`
    (see [below for nested schema](#nestedblock--timeouts))
`;

test('handles links with brackets')`
    [^\\[Упр\\]^](#example)
`;

test.skip('handles multiline tabs title')`
    {% list tabs %}

    * Tab1
      Tab1-Line2
    
      Tab content
    
    * Tab2
    
      Tab2-Line2
    
      Tab content
    
    {% endlist %}
`;

test('handles autolinks')`
     * A <http://gitgrimbo.github.io/harviewer/master/>
     * B <https://toolbox.googleapps.com/apps/har_analyzer/?lang=ru>
`;

test('## Start {#your-ideas}{% else %} end')`
    ## Start {#your-ideas}{% else %} end
`;

test('`{{ var }}` — one. Two')`
    \`{{ var }}\` — one. Two
`;

test('(a **18. B**).')`
    (a **18. B**).
`;

test('A ![](link) b. C.')`
    A ![](link) b. C.
`;

test.skip('A (B) {#C}\n:   A, b. E')`
    A (B) {#C}
    :   A, b. E 
`;

test('A. B [{#T}](D). C.')`
    A. B [{#T}](D). C.
`;

test('handles image with empty title at the end of segment')`
    A ![](./some/image.png). B.
`;

test('handles empty images')`
  - ![](./image1)
  - ![](./image2)
`;

test('handles link with empty title at the end of segment')`
    A [](./some/link). B.
`;

test('handles empty links')`
  - [](./link1)
  - [](./link2)
`;

test('handles single variable as content')`
    #|
    ||
    
    {{ reference-alerts.struct-table-protocol-alerts.request-id-col-1 }}
    
    ||
    |#
`;

test('handles self closing html tags')`
  # Header

  A a.
  B b.
  
  <keyword keyref="responce"/>
  
  ## End of text
  
  C!
`;

test('handles inline includes')`
  :   {% include [test](./test.md) %}
  OK
`;

test('handles link after sentence ending')`
    Sentence first. [Second](link.md) sentence.
`;

test('handles link after abbreviation')`
    Sentence first ex. [link](link.md) second sentence.
`;

test('handles link with variables in title')`
  [Link](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?")
`;

test('handles image with variables in title')`
  ![Image](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?")
`;

test('handles link with image with variables in title')`
  [![Image](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?" =x100)](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?")
`;

test('handles empty link in list')`
  1. **A**.
   [](../empty/link)
`;

test('handles empty image in list')`
  1. **A**.
   ![](../_assets/stat-segment.png)
`;

test('handles terms')`
  Some [term](*term)

  [*term]: Some multiline term.
  Here.
`;

test('handles wrond ordered terms')`
  Some [term](*term)

  [*term]: 
      Some multiline term.
      Here.
`;

test('handles different tabspaces')`
  - A

    - C

      <div style="padding: 15px;
              border: 1px solid var(--yc-color-line-generic);">
      </div>


- B

  <div style="padding: 15px;
        border: 1px solid var(--yc-color-line-generic);">
  </div>
`;

test('handles liquid in html attributes')`
  # Variable in href attribute

  <a href="{{ extref-chat-user-d9389e00 }}">
  <span class="button">Button</span>
  </a>
`;

test('handles &nbsp; in lists')`
  - Some text
     
      Some other text
`;

test('handles html line breaks')`
    ![](../image.png)
    |
    [**Moes** | Matter](https://link.html?sku_id=12000038372920468)<br/><br/>Moes Matter
    |
`;

test('handles heading anchors')`
    # Заголовок 1

    ## Заголовок 2 {#heading_2}
`;

test('handles dot in paired markup')`
    **Шаг 1. Воспроизведите ошибку**
`;

test('handles default code block as text')`
    Кодблок без указания языка

    \`\`\`
    Такой вот простенький кодблок
    \`\`\`

`;

test('handles text code block')`
    Кодблок text

    \`\`\`text
    Такой вот простенький кодблок
    \`\`\`
`;

test('handles bash code block')`
    Кодблок bash

    \`\`\`bash
    curl -H "Authorization: OAuth <ваш-OAuth-токен>" -X GET https://courier.yandex.ru/api/v1/test
    \`\`\`
`;

test('handles translate=no code block')`
    Кодблок не переводить

    \`\`\`bash translate=no
    curl -H "Authorization: OAuth <ваш-OAuth-токен>" -X GET https://courier.yandex.ru/api/v1/test
    \`\`\`
`;

test('handles {} and <> braces in code block')`
    Кодблок с фигурными скобками

    \`\`\`bash
    curl https://oauth.yandex.{{domain}}/authorize?response_type=token&client_id=<идентификатор приложения>
    \`\`\`
`;

test('handles standalone {#T} link')`
    A.

    [{#T}](D)

    B.
`;

test('handles {#T} link in sentence')`
    A.

    B. [{#T}](D). C.

    D.
`;

test('handles {#T} link within one paragraph')`
    A.
    B. [{#T}](D). C.
    D.
`;
