const markdown = `Document Title

Hello P{{ user.name.slice(1) }}!

Hello P{{ user.name.slice(1, 2) }}vel!
`;

const skeleton = `%%%1%%%
%%%2%%%

%%%3%%%
`;

const translations = new Map<string, string>([
    ['1', 'Титул Документа'],
    ['2', 'Привет П{{ user.name.slice(1) }}!'],
    ['3', 'Привет П{{ user.name.slice(1, 2) }}вел!'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
