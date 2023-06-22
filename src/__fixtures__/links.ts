const markdown = `\
параграф содержащий реф ссылку [{#T}](file.md "титул") продолжение предложения.
`;

const skeleton = `\
%%%1%%% [{#T}](file.md "%%%2%%%") %%%3%%%
`;

const translations = new Map<string, string>([
    ['1', 'paragraph with ref link'],
    ['2', 'title'],
    ['3', 'paragraph continuation'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
