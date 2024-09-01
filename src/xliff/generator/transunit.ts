export type TransUnitParams = {
    target?: string;
    targetLangLocale?: string;
    source?: string;
    sourceLangLocale?: string;
    compact?: boolean;
    id: number;
};

export function transunit(parameters: TransUnitParams) {
    const {source, sourceLangLocale, target, targetLangLocale, compact} = parameters;

    let rendered = ``;

    if (target?.length) {
        rendered += '\n';
        rendered += `<target`;
        if (!compact) {
            rendered += ` xml:space="preserve"`;

            if (targetLangLocale?.length) {
                rendered += ` xml:lang="${targetLangLocale}"`;
            }
        }
        rendered += '>';
        rendered += `${target}</target>`;
    }

    if (source) {
        rendered += '\n';
        rendered += `<source`;
        if (!compact) {
            rendered += ` xml:space="preserve"`;

            if (sourceLangLocale?.length) {
                rendered += ` xml:lang="${sourceLangLocale}"`;
            }
        }
        rendered += '>';
        rendered += `${source}</source>`;
    }

    return rendered.trim();
}
