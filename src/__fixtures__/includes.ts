const markdown = `\
{% include notitle [Description](../_includes/file.md) %}

{% include [Description](../_includes/file.md) %}
`;

const skeleton = `\
{% include notitle [Description](../_includes/file.md) %}

{% include [Description](../_includes/file.md) %}
`;

const translations = new Map<string, string>([]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
