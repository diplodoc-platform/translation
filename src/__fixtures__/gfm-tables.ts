const markdown = `\
|Заголовок 1|Заголовок 2|
|-----------|-----------|
|[текст ссылки](https://www.google.com)|**жирный текст**|
|![текст картинки](image.png "подсказка")|*курсив*|
`;

const skeleton = `\
|%%%1%%%|%%%2%%%|
|-----------|-----------|
|[%%%3%%%](https://www.google.com)|**%%%4%%%**|
|![%%%5%%%](image.png "%%%6%%%")|*%%%7%%%*|
`;

const translations = new Map<string, string>([
    ['1', 'Header 1'],
    ['2', 'Header 2'],
    ['3', 'link text'],
    ['4', 'bold text'],
    ['5', 'image text'],
    ['6', 'hint'],
    ['7', 'italics'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
