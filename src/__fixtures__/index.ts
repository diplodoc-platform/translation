// xlf, skeleton testing
const markdown = `# Заголовок 1

Параграф

- Первый элемент списка
- Второй элемент списка

Заголовок 2
-----------

Параграф содержащий **жирный текст** и *курсив*

А ещё ключевые особенности структуры проекта освещают чрезвычайно интересные особенности картины в целом. Предложения складываются в абзацы — и вы наслаждетесь очередным бредошедевром.

> текст внутри цитаты

1. Первый элемент нумерованного списка
2. Второй элемент нумерованного списка

[Текст ссылки. Всё ещё текст ссылки.](files/file.md "Описание ссылки. Всё ещё описание ссылки.")

![Альтернативный текст картинки. Всё ещё альт. текст картинки.](files/image.png "Титул картинки. Всё ещё титул картинки.")
`;

// markdown testing
const skeleton = `# %%%1%%%
%%%2%%%
- %%%3%%%
- %%%4%%%
%%%5%%%
-----------
%%%6%%% **%%%7%%%** %%%8%%% *%%%9%%%*

%%%10%%% %%%11%%%
> %%%12%%%
1. %%%13%%%
2. %%%14%%%

[%%%15%%% %%%16%%%](files/file.md "%%%17%%% %%%18%%%")

![%%%19%%% %%%20%%%](files/image.png "%%%21%%% %%%22%%%")
`;

const translations = new Map<string, string>([
    ['1', 'Heading 1'],
    ['2', 'Paragraph'],
    ['3', 'First list item'],
    ['4', 'Second list item'],
    ['5', 'Heading 2'],
    ['6', 'Paragraph with'],
    ['7', 'bold text'],
    ['8', 'and'],
    ['9', 'italics'],
    [
        '10',
        'Also key features of the project structure highlight extremely interesting features of the picture as a whole.',
    ],
    ['11', 'Sentences add up to paragraphs — and you will enjoy another delirium.'],
    ['12', 'text inside of the blockquote'],
    ['13', 'First ordered list item'],
    ['14', 'Second ordered list item'],
    ['15', 'Link text.'],
    ['16', 'Link text continued.'],
    ['17', 'Link description.'],
    ['18', 'Link description continued.'],
    ['19', 'Alternative image text'],
    ['20', 'Alt. text continued'],
    ['21', 'Image title'],
    ['22', 'Image title continued'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
