const markdown = `# {{ service-name }} Service

Try out {{ service-name }} and let us know what you think

Also check out [{{ other-service-name }}](files/file.md "{{ other-service-name }} description")

![{{ service-name }} usage screenshot](files/image.png "{{ service-name }} in action")
`;

const skeleton = `# %%%1%%%
%%%2%%%

%%%3%%% [%%%4%%%](files/file.md "%%%5%%%")

![%%%6%%%](files/image.png "%%%7%%%")
`;

const translations = new Map<string, string>([
    ['1', '{{ service-name }} Сервис'],
    ['2', 'Попробуйте {{ service-name }} и расскажите нам что вы думаете о нём.'],
    ['3', 'Также присмотритесь к'],
    ['4', '{{ other-service-name }}'],
    ['5', '{{ other-service-name }} описание'],
    ['6', 'скриншот использования {{ service-name }}'],
    ['7', '{{ service-name }} в действие'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
