const markdown = `\
{% list tabs %}

- Первый Таб

  Текст первого таба

  - список внутри таба
        
    контент внутри списка
- Второй Таб
  
  Текст второго таба

{% endlist %}

{% list tabs %}

* Первый Таб во второй таб секции

  контент первого таба во второй таб секции

{% endlist %}
`;

const skeleton = `\
{% list tabs %}

- %%%1%%%

  %%%2%%%

  - %%%3%%%
        
    %%%4%%%
- %%%5%%%
  
  %%%6%%%

{% endlist %}

{% list tabs %}

* %%%7%%%

  %%%8%%%

{% endlist %}
`;

const translations = new Map<string, string>([
    ['1', 'First tab'],
    ['2', 'text of the first tab'],
    ['3', 'list inside the tab'],
    ['4', 'content inside the list'],
    ['5', 'Second tab'],
    ['6', 'text of the second tab'],
    ['7', 'First tab inside the second tab section'],
    ['8', 'content of the first tab inside the second tab section'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
