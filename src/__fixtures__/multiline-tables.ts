const markdown = `\
#|
||**Первый Заголовок**|**Второй Заголовок**||
||текст первой колонки|текст второй колонки||
|#

- текст перед таблицей

  #|
  ||
  Первый Заголовок
  |
  Второй Заголовок
  ||
  ||
  текст первой колонки
  |
  текст второй колонки
  ||
  |#

  текст после таблицы
`;

const skeleton = `\
#|
||**%%%1%%%**|**%%%2%%%**||
||%%%3%%%|%%%4%%%||
|#

- %%%5%%%

  #|
  ||
  %%%6%%%
  |
  %%%7%%%
  ||
  ||
  %%%8%%%
  |
  %%%9%%%
  ||
  |#

  %%%10%%%
`;

const translations = new Map<string, string>([
    ['1', 'First Heading'],
    ['2', 'Second Heading'],
    ['3', 'first cell text'],
    ['4', 'second cell text'],
    ['5', 'text before table'],
    ['6', 'First Heading'],
    ['7', 'Second Heading'],
    ['8', 'first cell text'],
    ['9', 'second cell text'],
    ['10', 'text after table'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
