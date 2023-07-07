const markdown = `\
@[youtube](https://www.youtube.com/video?v=dQw4w9WgXcQ) текст после
@[youtube](dQw4w9WgXcQ)
`;

const skeleton = `\
@[youtube](https://www.youtube.com/video?v=dQw4w9WgXcQ) %%%1%%%
@[youtube](dQw4w9WgXcQ)
`;

const translations = new Map<string, string>([['1', 'text after']]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
