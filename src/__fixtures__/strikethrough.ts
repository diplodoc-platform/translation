const markdown = `\
~~перечеркнуто~~
[привет ~~мир~~ мне ~~хорошо~~](href "подсказка")
`;

const skeleton = `\
~~%%%1%%%~~
[%%%2%%% ~~%%%3%%%~~ %%%4%%% ~~%%%5%%%~~](href "%%%6%%%")
`;

const translations = new Map<string, string>([
    ['1', 'striketrough'],
    ['2', 'hello'],
    ['3', 'world'],
    ['4', "i'm"],
    ['5', 'fine'],
    ['6', 'hint'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
