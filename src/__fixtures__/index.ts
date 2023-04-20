const markdown = `# Заголовок 1

Параграф

- Первый элемент списка
- Второй элемент списка

Заголовок 2
-----------

Параграф содержащий **жирный текст** и *курсив*

> текст внутри цитаты

1. Первый элемент нумерованного списка
2. Второй элемент нумерованного списка

[Текст ссылки](files/file.md "Описание ссылки")

![Альтернативный текст картинки](files/image.png "Титул картинки")
`;

const skeleton = `# %%%1%%%
%%%2%%%
- %%%3%%%
- %%%4%%%
%%%5%%%
-----------
%%%6%%%**%%%7%%%**%%%8%%%*%%%9%%%*
> %%%10%%%
1. %%%11%%%
2. %%%12%%%

[%%%13%%%](files/file.md "%%%14%%%")
`;

const translations = new Map<string, string>([
    ['1', 'Heading 1'],
    ['2', 'Paragraph'],
    ['3', 'First list item'],
    ['4', 'Second list item'],
    ['5', 'Heading 2'],
    ['6', 'Paragraph with '],
    ['7', 'bold text'],
    ['8', ' and '],
    ['9', 'italic'],
    ['10', 'text inside of the blockquote'],
    ['11', 'First ordered list item'],
    ['12', 'Second ordered list item'],
    ['13', 'Link text'],
    ['14', 'Link Description'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
