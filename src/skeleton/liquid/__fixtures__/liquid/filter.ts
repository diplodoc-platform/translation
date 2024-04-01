import {Fixtures} from './fixture';

const filter: Fixtures = [
  {
    section: 'filter',
    content: 'Hello P{{user.name | capitalize}}!',
    number: 1,
  },
  {
    section: 'filter',
    content: 'We have {{user.name | length}} users.',
    number: 2,
  },
  {
    section: 'filter',
    content: 'Users amount: {{ user.name | length }}.',
    number: 3,
  },
  {
    section: 'filter',
    content: 'Users amount: {{ user_name-cool | length }}.',
    number: 4,
  },
];

export {filter};
export default {filter};
