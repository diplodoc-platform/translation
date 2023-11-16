import {Fixtures} from './fixture';

const variable: Fixtures = [
    {
        section: 'variable',
        content: 'Hello {{user.name}}!',
        number: 1,
    },
    {
        section: 'variable',
        content: 'We have {{ user.name }} users.',
        number: 2,
    },
    {
        section: 'variable',
        content: 'Users amount: {{user.name}}.',
        number: 3,
    },
    {
        section: 'variable',
        content: 'Users amount: {{user_name-cool}}.',
        number: 4,
    },
];

export {variable};
export default {variable};
