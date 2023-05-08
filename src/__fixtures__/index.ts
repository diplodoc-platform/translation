const markdown = `# Заголовок 1

Параграф

- Первый элемент списка
- Второй элемент списка

Заголовок 2
-----------

Параграф содержащий **жирный текст** и *курсив*

А ещё ключевые особенности структуры проекта освещают чрезвычайно интересные особенности картины в целом. Предложения складываются в абзацы — и вы наслаждетесь очередным бредошедевром.

> текст внутри цитаты

1. Первый элемент нумерованного списка
2. Второй элемент нумерованного списка

[Текст ссылки. Всё ещё текст ссылки.](files/file.md "Описание ссылки. Всё ещё описание ссылки.")

![Альтернативный текст картинки. Всё ещё альт. текст картинки.](files/image.png "Титул картинки. Всё ещё титул картинки.")
`;

const skeleton = `# %%%1%%%
%%%2%%%
- %%%3%%%
- %%%4%%%
%%%5%%%
-----------
%%%6%%% **%%%7%%%** %%%8%%% *%%%9%%%*

%%%10%%% %%%11%%%
> %%%12%%%
1. %%%13%%%
2. %%%14%%%

[%%%15%%% %%%16%%%](files/file.md "%%%17%%% %%%18%%%")

![%%%19%%% %%%20%%%](files/image.png "%%%21%%% %%%22%%%")
`;

const translations = new Map<string, string>([
    ['1', 'Heading 1'],
    ['2', 'Paragraph'],
    ['3', 'First list item'],
    ['4', 'Second list item'],
    ['5', 'Heading 2'],
    ['6', 'Paragraph with'],
    ['7', 'bold text'],
    ['8', 'and'],
    ['9', 'italics'],
    [
        '10',
        'Also key features of the project structure highlight extremely interesting features of the picture as a whole.',
    ],
    ['11', 'Sentences add up to paragraphs — and you will enjoy another delirium.'],
    ['12', 'text inside of the blockquote'],
    ['13', 'First ordered list item'],
    ['14', 'Second ordered list item'],
    ['15', 'Link text.'],
    ['16', 'Link text continued.'],
    ['17', 'Link description.'],
    ['18', 'Link description continued.'],
    ['19', 'Alternative image text'],
    ['20', 'Alt. text continued'],
    ['21', 'Image title'],
    ['22', 'Image title continued'],
]);

const markdownWithVariables = `# {{ service-name }} Service

Try out {{ service-name }} and let us know what you think

Also check out [{{ other-service-name }}](files/file.md "{{ other-service-name }} description")

![{{ service-name }} usage screenshot](files/image.png "{{ service-name }} in action")
`;

const skeletonWithVariables = `# %%%1%%%
%%%2%%%

%%%3%%% [%%%4%%%](files/file.md "%%%5%%%")

![%%%6%%%](files/image.png "%%%7%%%")
`;

const translationsWithVariables = new Map<string, string>([
    ['1', '{{ service-name }} Сервис'],
    ['2', 'Попробуйте {{ service-name }} и расскажите нам что вы думаете о нём.'],
    ['3', 'Также присмотритесь к'],
    ['4', '{{ other-service-name }}'],
    ['5', '{{ other-service-name }} описание'],
    ['6', 'скриншот использования {{ service-name }}'],
    ['7', '{{ service-name }} в действие'],
]);

const markdownWithFilters = `# Document Title
Hello {{ user.name | capitalize }}!

total number of users: {{ users | length }}
`;

const skeletonWithFilters = `%%%1%%%
%%%2%%%

%%%3%%%
`;

const translationsWithFilters = new Map<string, string>([
    ['1', 'Титул Документа'],
    ['2', 'Привет {{ user.name | capitalize }}!'],
    ['3', 'всего пользователей: {{ users | length }}'],
]);

const markdownWithFunctions = `Document Title

Hello P{{ user.name.slice(1) }}!

Hello P{{ user.name.slice(1, 2) }}vel!
`;

const skeletonWithFunctions = `%%%1%%%
%%%2%%%

%%%3%%%
`;

const translationsWithFunctions = new Map<string, string>([
    ['1', 'Титул Документа'],
    ['2', 'Привет П{{ user.name.slice(1) }}!'],
    ['3', 'Привет П{{ user.name.slice(1, 2) }}вел!'],
]);

const markdownWithConditionals = `# Document Title

{% if OS == 'iOS' %}

Download the app from the [{{ ios-marketplace }} Store](https://www.apple.com/ios/app-store/).

{% else %}

Download the app from [{{ other-marketplace }} Store](https://play.google.com).

Some text {% if  OS == 'iOS' %} Apple {% else %} Android {% endif %} text continued.

{% endif %}
`;

const skeletonWithConditionals = `# %%%1%%%

{% if OS == 'iOS' %}

%%%2%%% [%%%3%%%](https://www.apple.com/ios/app-store)%%%4%%%

{% else %}

%%%5%%% [%%%6%%%](https://play.google.com)%%%7%%%

%%%8%%% {% if  OS == 'iOS' %} %%%9%%% {% else %} %%%10%%% {% endif %} %%%11%%%

{% endif %}
`;

const translationsWithConditionals = new Map<string, string>([
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

const markdownWithLoops = `# Document Title

{% for element in array %}

Some text {{ variable_name }} text continued.

{% endfor %}

before inline loop {% for element in array %} text inside with {{variable}} {% endfor %} after inline loop
`;

const skeletonWithLoops = `# %%%1%%%

{% for element in array %}

%%%2%%%

{% endfor %}

%%%3%%% {% for element in array %} %%%4%%% {% endfor %} %%%5%%%
`;

const translationsWithLoops = new Map<string, string>([
    ['1', 'Титул Документа'],
    ['2', 'Какой-то текст {{ variable_name }} продолжение текста.'],
    ['3', 'Перед однострочным циклом'],
    ['4', 'текст внутри содержащий {{variable}}'],
    ['5', 'после однострочного цикла'],
]);

const markdownWithMeta = `---
title: Создание виртуальной машины Windows
description: Cоздайте виртуальную машину Windows в облаке с помощью сервиса {{ compute-short-name }}. Вы можете подключиться к виртуальной машине Windows используя Remote Dektop Protocol (RDP), встроенный в образ ОС. Перед подключением к виртуальной машине Windows убедитесь, что NLA включен в настройках вашего компьютера.

key: >
  Sammy Sosa

  Let's Goooo

seq:
  - windows
  - windows vm
  - windows вм
  - windows виртуальная машина
  - виртуальная машина
  - вм

seq_of_mappings:
  -
    name: Mark
    age: 13
  -
    name: Noam
    age: 99

# comment

object_inline: {name: John Smith, age: 33}
array_inline: [milk, pumpkin pie, eggs, juice]
seq_of_seq:
  - [Mark McGwire, 65, 0.278]
  - [Sammy Sosa  , 63, 0.288]
nesting:
  - { children: [{name: bob}, {name: marry}]}
---
# Мета

Комментарии и метаданные — это элементы разметки, которые не отображаются в собранном файле. Они используются, чтобы хранить в исходном тексте информацию для SEO или авторов документа.
`;

const skeletonWithMeta = `---
title: '%%%1%%%'
description: '%%%2%%% %%%3%%% %%%4%%%'
key: |
      %%%5%%%
seq:
  - '%%%6%%%'
  - '%%%7%%%'
  - '%%%8%%%'
  - '%%%9%%%'
  - '%%%10%%%'
  - '%%%11%%%'
seq_of_mappings:
  - name: '%%%12%%%'
    age: 13
  - name: '%%%13%%%'
    age: 99
object_inline:
  name: '%%%14%%%'
  age: 33
array_inline:
  - '%%%15%%%'
  - '%%%16%%%'
  - '%%%17%%%'
  - '%%%18%%%'
seq_of_seq:
  - - '%%%19%%%'
    - 65
    - 0.278
  - - '%%%20%%%'
    - 63
    - 0.288
nesting:
  - children:
    - name: '%%%21%%%'
    - name: '%%%22%%%'
---
# %%%23%%%
%%%24%%% %%%25%%%
`;

const translationsWithMeta = new Map<string, string>([
    ['1', 'Creation of the Windows virtual machine'],
    ['2', 'Create Windows virtual machine with {{ compute-short-name }} service.'],
    ['3', 'You can connect to the virtual machine using Remote Desktop Protocol (RDP).'],
    ['4', 'Before connecting ensure that NLA is enabled.'],
    ['5', "Sammy Sosa\n\nLet's Goooo"],
    ['6', 'windows'],
    ['7', 'windows vm'],
    ['8', 'windows vm'],
    ['9', 'windows virtual machine'],
    ['10', 'virtual machine'],
    ['11', 'vm'],
    ['12', 'Mark'],
    ['13', 'Noam'],
    ['14', 'John Smith'],
    ['15', 'milk'],
    ['16', 'pumpkin pie'],
    ['17', 'eggs'],
    ['18', 'juice'],
    ['19', 'Mark McGwire'],
    ['20', 'Sammy Sosa'],
    ['21', 'bob'],
    ['22', 'marry'],
    ['23', 'Meta'],
    ['24', 'Comments and metadata - not displayed in the final file.'],
    ['25', 'They are used to make comments for other writers or set meta into final html for seo.'],
]);

export {
    markdown,
    skeleton,
    translations,
    markdownWithVariables,
    skeletonWithVariables,
    translationsWithVariables,
    markdownWithConditionals,
    skeletonWithConditionals,
    translationsWithConditionals,
    markdownWithLoops,
    skeletonWithLoops,
    translationsWithLoops,
    markdownWithFilters,
    skeletonWithFilters,
    translationsWithFilters,
    markdownWithFunctions,
    skeletonWithFunctions,
    translationsWithFunctions,
    markdownWithMeta,
    skeletonWithMeta,
    translationsWithMeta,
};

export default {
    markdown,
    skeleton,
    translations,
    markdownWithVariables,
    skeletonWithVariables,
    translationsWithVariables,
    markdownWithConditionals,
    skeletonWithConditionals,
    translationsWithConditionals,
    markdownWithLoops,
    skeletonWithLoops,
    translationsWithLoops,
    markdownWithFilters,
    skeletonWithFilters,
    translationsWithFilters,
    markdownWithFunctions,
    skeletonWithFunctions,
    translationsWithFunctions,
    markdownWithMeta,
    skeletonWithMeta,
    translationsWithMeta,
};
