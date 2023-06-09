const markdown = `\
параграф текста, 1^ая^ строчка
это 2^ая^ строчка
[1^ая^ ссылка в параграфе](file.md)
`;

const skeleton = `\
%%%1%%%^%%%2%%%^ %%%3%%%
%%%4%%%^%%%5%%%^ %%%6%%%
[%%%7%%%^%%%8%%%^ %%%9%%%](file.md)
`;

const translations = new Map<string, string>([
    ['1', 'paragraph of text 1'],
    ['2', 'st'],
    ['3', 'line'],
    ['4', 'this is 2'],
    ['5', 'nd'],
    ['6', 'line'],
    ['7', '1'],
    ['8', 'st'],
    ['9', 'link inside the paragraph'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
