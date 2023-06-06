const markdown = `\
{% note info "Информация" %}

информация

{% endnote %}

- список с запиской

  {% note alert "Предупреждение" %}

  предупреждение

  {% endnote %}
`;

const skeleton = `\
{% note info "%%%1%%%" %}

%%%2%%%

{% endnote %}

- %%%3%%%

  {% note alert "%%%4%%%" %}

  %%%5%%%

  {% endnote %}
`;

const translations = new Map<string, string>([
    ['1', 'Information'],
    ['2', 'information'],
    ['3', 'list with note inside'],
    ['4', 'Alert'],
    ['5', 'alert'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
