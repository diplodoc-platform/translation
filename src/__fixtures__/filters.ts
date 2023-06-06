const markdown = `# Document Title
Hello {{ user.name | capitalize }}!

total number of users: {{ users | length }}
`;

const skeleton = `%%%1%%%
%%%2%%%

%%%3%%%
`;

const translations = new Map<string, string>([
    ['1', 'Титул Документа'],
    ['2', 'Привет {{ user.name | capitalize }}!'],
    ['3', 'всего пользователей: {{ users | length }}'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
