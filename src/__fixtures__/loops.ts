const markdown = `# Document Title

{% for element in array %}

Some text {{ variable_name }} text continued.

{% endfor %}

before inline loop {% for element in array %} text inside with {{variable}} {% endfor %} after inline loop
`;

const skeleton = `# %%%1%%%

{% for element in array %}

%%%2%%%

{% endfor %}

%%%3%%% {% for element in array %} %%%4%%% {% endfor %} %%%5%%%
`;

const translations = new Map<string, string>([
    ['1', 'Титул Документа'],
    ['2', 'Какой-то текст {{ variable_name }} продолжение текста.'],
    ['3', 'Перед однострочным циклом'],
    ['4', 'текст внутри содержащий {{variable}}'],
    ['5', 'после однострочного цикла'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
