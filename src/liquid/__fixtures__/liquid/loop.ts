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
    {
        section: 'loop',
        content: `{%for x.a_b in xs.ys%} x {%endfor%}`,
        number: 3,
    },
    {
        section: 'loop',
        content: `\
{%for x.a_b in xs.ys%}

{{a_b.c}}

{%endfor%}`,
        number: 4,
    },
];

export {loop};
export default {loop};
