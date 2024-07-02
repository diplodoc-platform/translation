/* eslint-disable @typescript-eslint/no-unused-expressions */

import {compose, extract} from 'src/api';
import {trim} from 'src/utils';

const test = (() => {
  function test(name: string, call?: 'skip' | 'only') {
    return function (parts: TemplateStringsArray) {
      const markdown = trim(parts.join(''));

      describe('integration', () => {
        const caller = call ? it[call] : it;
        caller(name, () => {
          const {xliff, skeleton, units} = extract(markdown, {
            compact: true,
            source: {
              language: 'ru',
              locale: 'RU',
            },
            target: {
              language: 'en',
              locale: 'US',
            },
          });

          expect(xliff).toMatchSnapshot();
          expect(skeleton).toMatchSnapshot();

          if (!units.length) {
            return;
          }

          const result = compose(skeleton, xliff, {useSource: true});

          expect(result).toEqual(markdown);
          expect(result).toMatchSnapshot();
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

test('handles link with variables in title')`
  [Link](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?")
`;

test('handles image with variables in title')`
  ![Image](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?")
`;

test('handles link with image with variables in title')`
  [![Image](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?" x100)](index-mini.md "Title {{product-name-short.station-mini-old}}. And what?")
`;