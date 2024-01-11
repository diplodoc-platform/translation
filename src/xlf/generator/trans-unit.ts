export type TransUnitParameters = {
    target?: string;
    targetLangLocale?: string;
    source?: string;
    sourceLangLocale?: string;
    id: number;
};

function generateTransUnit(parameters: TransUnitParameters) {
    const {source, sourceLangLocale, target, targetLangLocale, id} = parameters;

    let rendered = `  <trans-unit id="${id}">`;

    if (source?.length) {
        rendered += '\n';
        rendered += ' '.repeat(4);
        rendered += `<source`;
        if (sourceLangLocale?.length) {
            rendered += ` xml:lang="${sourceLangLocale}"`;
        }
        rendered += '>';
        rendered += `${source}</source>`;
    }

    if (target?.length) {
        rendered += '\n';
        rendered += ' '.repeat(4);
        rendered += `<target`;
        if (targetLangLocale?.length) {
            rendered += ` xml:lang="${targetLangLocale}"`;
        }
        rendered += '>';
        rendered += `${target}</target>`;
    }

    rendered += '\n';
    rendered += '  </trans-unit>';

    return rendered;
}

export {generateTransUnit};
export default {generateTransUnit};
