const markdown = `\
[*ключ_термина]: первая строка
вторая строка ##базовую## ~~разметку~~.

Использование [термина](*ключ_термина) в тексте
`;

const skeleton = `\
[*ключ_термина]: %%%1%%%
%%%2%%% ##%%%3%%%##%%%4%%%~~%%%5%%%~~%%%6%%%

%%%7%%% [%%%8%%%](*ключ_термина) %%%9%%%
`;

const translations = new Map<string, string>([
    ['1', 'first line'],
    ['2', 'second line'],
    ['3', 'basic'],
    ['4', ' '],
    ['5', 'markup'],
    ['6', '.'],
    ['7', 'usage'],
    ['8', 'term'],
    ['9', 'in text'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
