const markdown = `\
{% cut "Заголовок Ката" %}

Контент внутри ката

{% endcut %}
`;

const skeleton = `\
{% cut "%%%1%%%" %}

%%%2%%%

{% endcut %}
`;

const translations = new Map<string, string>([
    ['1', 'Cut Title'],
    ['2', 'Content inside of the cut'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
