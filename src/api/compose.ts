import {ok} from 'assert';
import {getTranslations} from 'src/xlf/translations';

export type ComposeParams = {
    skeleton: string;
    xlf?: string;
    units?: string[];
    useSource?: boolean;
};

export function compose(parameters: ComposeParams) {
    validateParams(parameters);

    const translations = getTranslations(parameters);

    return replace(parameters.skeleton, translations)[0];
}

function replace(source: string, translations: Map<string, string>): [string, boolean] {
    let matched = false;

    const result = source.replace(/%%%(\d+)%%%/g, (_, id: string) => {
        matched = true;

        if (!translations.has(id)) {
            throw new Error('Translation token not found.');
        }

        let [value, submatch] = replace(translations.get(id) as string, translations);
        while (submatch) {
            [value, submatch] = replace(value, translations);
        }

        return value;
    });

    return [result, matched];
}

function validateParams(parameters: ComposeParams) {
    ok(
        parameters.useSource === undefined || typeof parameters.useSource === 'boolean',
        'Unexpected useSource value',
    );
    ok(parameters.skeleton, 'Skeleton is empty');
    ok(parameters.xlf || parameters.units?.length, 'Source is empty');
}
