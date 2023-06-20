const markdown = `\
параграф с ![картинкой внутри](image.png "альт текст" =13x37) с указанной шириной и высотой
`;

const skeleton = `\
%%%1%%% ![%%%2%%%](image.png "%%%3%%%" =13x37) %%%4%%%
`;

const translations = new Map<string, string>([
    ['1', 'paragraph with'],
    ['2', 'image inside'],
    ['3', 'alt text'],
    ['4', 'with width and height specified'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
