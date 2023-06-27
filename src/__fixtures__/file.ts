const markdown = `\
{% file src="sample-file" name="файлик.zip" type="application/zip" %} текст {% file src="sample-file" name="файлик2.zip" type="application/zip" %}
`;

const skeleton = `
{% file src="sample-file" name="%%%1%%%" type="application/zip" %} %%%2%%% {% file src="sample-file" name="%%%3%%%" type="application/zip" %}
`;

const translations = new Map<string, string>([
    ['1', 'file.zip'],
    ['2', 'text'],
    ['3', 'file2.zip'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
