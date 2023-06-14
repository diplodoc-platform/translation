const markdown = `
[ ] первый

[x] второй

- [_] надо сделать подчёркивание
- [-] надо сделать тире
- [ ] надо сделать пробел
- [x] сделано крестик
- [X] сделано крестик заглавный

- элемент листа
  - [x] сделан
  - [ ] надо сделaть
`;

const skeleton = `\
[ ] %%%1%%%

[x] %%%2%%%
- [_] %%%3%%%
- [-] %%%4%%%
- [ ] %%%5%%%
- [x] %%%6%%%
- [X] %%%7%%%

- %%%8%%%
  - [x] %%%9%%%
  - [ ] %%%10%%%
`;

const translations = new Map<string, string>([
    ['1', 'first'],
    ['2', 'second'],
    ['3', 'to be done underscore'],
    ['4', 'to be done dash'],
    ['5', 'to be done space'],
    ['6', 'done cross'],
    ['7', 'done capital cross'],
    ['8', 'list element'],
    ['9', 'done'],
    ['10', 'to be done'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
