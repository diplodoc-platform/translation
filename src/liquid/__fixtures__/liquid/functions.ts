import {Fixtures} from './fixture';

const functions: Fixtures = [
    {
        section: 'functions',
        content: 'Hello P{{ user.name.slice(1, 2) }}vel!',
        number: 1,
    },
    {
        section: 'functions',
        content: 'Sentence {{user.name.slice(1)}} content after.',
        number: 2,
    },
    {
        section: 'functions',
        content: '{{user.slice(1)}}.',
        number: 3,
    },
];

export {functions};
export default {functions};
