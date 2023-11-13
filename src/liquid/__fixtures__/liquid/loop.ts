import {Fixtures} from './fixture';

const loop: Fixtures = [
    {
        section: 'loop',
        content: `{% for x in xs %} x {% endfor %}`,
        number: 1,
    },
    {
        section: 'loop',
        content: `{%for x in xs%} x {%endfor%}`,
        number: 2,
    },
];

export {loop};
export default {loop};
