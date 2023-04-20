function replaceHashes(content: string, translations: Map<string, string>) {
    let replaced = content;

    replaced = replaced.replace(/%%%(\d+)%%%/mu, function (match, id) {
        const parsed = parseInt(id, 10);

        const translation = translations.get(String(parsed));
        if (!translation?.length) {
            throw new Error('failed replacing with translation');
        }

        return translation;
    });

    return replaced;
}

export {replaceHashes};
export default {replaceHashes};
