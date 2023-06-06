const markdown = `# Document Title

{% if OS == 'iOS' %}

Download the app from the [{{ ios-marketplace }} Store](https://www.apple.com/ios/app-store/).

{% else %}

Download the app from [{{ other-marketplace }} Store](https://play.google.com).

Some text {% if  OS == 'iOS' %} Apple {% else %} Android {% endif %} text continued.

{% endif %}
`;

const skeleton = `# %%%1%%%

{% if OS == 'iOS' %}

%%%2%%% [%%%3%%%](https://www.apple.com/ios/app-store)%%%4%%%

{% else %}

%%%5%%% [%%%6%%%](https://play.google.com)%%%7%%%

%%%8%%% {% if  OS == 'iOS' %} %%%9%%% {% else %} %%%10%%% {% endif %} %%%11%%%

{% endif %}
`;

const translations = new Map<string, string>([
    ['1', 'Титул Документа'],
    ['2', 'Скачайте приложение из '],
    ['3', '{{ ios-marketplace }} Стора'],
    ['4', '.'],
    ['5', 'Скачайте приложение из '],
    ['6', '{{ other-marketplace }} Стора'],
    ['7', '.'],
    ['8', 'Какой-то текст'],
    ['9', 'Apple'],
    ['10', 'Android'],
    ['11', 'Продолжение текста.'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
