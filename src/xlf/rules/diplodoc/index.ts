export type DiplodocRulesState = {};

function initState() {
    return () => ({});
}

const always =
    <T>(a: T) =>
    () =>
        a;

const alwaysEmptyString = always('');

const rules = {
    yfm_note_open: alwaysEmptyString,
    yfm_note_close: alwaysEmptyString,
    yfm_note_title_open: alwaysEmptyString,
    yfm_note_title_close: alwaysEmptyString,
    yfm_cut_open: alwaysEmptyString,
    yfm_cut_title_open: alwaysEmptyString,
    yfm_cut_title_close: alwaysEmptyString,
    yfm_cut_content_open: alwaysEmptyString,
    yfm_cut_content_close: alwaysEmptyString,
    yfm_cut_close: alwaysEmptyString,
};

export {rules, initState};
export default {rules, initState};
