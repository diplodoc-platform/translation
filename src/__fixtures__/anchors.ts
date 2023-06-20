const markdown = `\
# заголовок без явного якоря
параграф

## заголовок с явным якорем {#anchor}
`;

const skeleton = `
# %%%1%%%
%%%2%%%

## %%%3%%% {#anchor}
`;

const translations = new Map<string, string>([
    ['1', 'heading with implicit anchor'],
    ['2', 'paragraph'],
    ['3', 'heading with explicit anchor'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
