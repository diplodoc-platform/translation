export type TransUnitParameters = {
    indentation?: number;
    target?: string;
    targetLangLocale?: string;
    source?: string;
    sourceLangLocale?: string;
    id: number;
};

function generate(parameters: TransUnitParameters) {
    const {source, sourceLangLocale, target, targetLangLocale, id, indentation = 0} = parameters;

    let rendered = ' '.repeat(indentation + 2);
    rendered += `<trans-unit id="${id}">`;

    if (source?.length) {
        rendered += '\n';
        rendered += ' '.repeat(indentation + 4);
        rendered += `<source`;
        if (sourceLangLocale?.length) {
            rendered += ` xml:lang="${sourceLangLocale}"`;
        }
        rendered += '>';
        rendered += `${source}</source>`;
    }

    if (target?.length) {
        rendered += '\n';
        rendered += ' '.repeat(indentation + 4);
        rendered += `<target`;
        if (targetLangLocale?.length) {
            rendered += ` xml:lang="${targetLangLocale}"`;
        }
        rendered += '>';
        rendered += `${target}</target>`;
    }

    rendered += '\n';
    rendered += ' '.repeat(indentation + 2);
    rendered += '</trans-unit>';

    return rendered;
}

export {generate};
export default {generate};
