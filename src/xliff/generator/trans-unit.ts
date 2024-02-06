export type TransUnitParams = {
    target?: string;
    targetLangLocale?: string;
    source?: string;
    sourceLangLocale?: string;
    id: number;
};

export function generateTransUnit(parameters: TransUnitParams) {
    const {source, sourceLangLocale, target, targetLangLocale} = parameters;

    let rendered = ``;

    if (target?.length) {
        rendered += '\n';
        rendered += `<target`;
        if (targetLangLocale?.length) {
            rendered += ` xml:lang="${targetLangLocale}"`;
        }
        rendered += '>';
        rendered += `${target}</target>`;
    }

    if (source) {
        rendered += '\n';
        rendered += `<source`;
        if (sourceLangLocale?.length) {
            rendered += ` xml:lang="${sourceLangLocale}"`;
        }
        rendered += '>';
        rendered += `${source}</source>`;
    }

    return rendered.trim();
}
