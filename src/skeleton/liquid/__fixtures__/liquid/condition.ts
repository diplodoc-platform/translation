import type {Fixtures} from './fixture';

const condition: Fixtures = [
    {
        section: 'conditions',
        content: "Person is: {% if personType == 'cool' %} cool {% else %} not cool.",
        number: 1,
    },
    {
        section: 'conditions',
        content:
            '{%if var == "a"%} A {%else%} B was the point we examined. Now examine let\'s examine others.',
        number: 2,
    },
    {
        section: 'conditions',
        content: `{% if var == "a" %}

Content when var is equal a

{% else %}

Content when var is not equal a

{% endif %}

`,
        number: 3,
    },
];

export {condition};
export default {condition};
