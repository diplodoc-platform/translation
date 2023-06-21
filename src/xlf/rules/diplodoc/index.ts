import {yfmFile} from './file';

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
    // notes
    yfm_note_open: alwaysEmptyString,
    yfm_note_close: alwaysEmptyString,
    yfm_note_title_open: alwaysEmptyString,
    yfm_note_title_close: alwaysEmptyString,
    // cuts
    yfm_cut_open: alwaysEmptyString,
    yfm_cut_title_open: alwaysEmptyString,
    yfm_cut_title_close: alwaysEmptyString,
    yfm_cut_content_open: alwaysEmptyString,
    yfm_cut_content_close: alwaysEmptyString,
    yfm_cut_close: alwaysEmptyString,
    // gfm tables
    table_open: alwaysEmptyString,
    thead_open: alwaysEmptyString,
    tr_open: alwaysEmptyString,
    tr_close: alwaysEmptyString,
    th_open: alwaysEmptyString,
    th_close: alwaysEmptyString,
    thead_close: alwaysEmptyString,
    tbody_open: alwaysEmptyString,
    tbody_close: alwaysEmptyString,
    td_open: alwaysEmptyString,
    td_close: alwaysEmptyString,
    table_close: alwaysEmptyString,
    // sup
    sup_open: alwaysEmptyString,
    sup_close: alwaysEmptyString,
    // checkbox
    checkbox_open: alwaysEmptyString,
    checkbox_input: alwaysEmptyString,
    checkbox_label_open: alwaysEmptyString,
    checkbox_label_close: alwaysEmptyString,
    checkbox_close: alwaysEmptyString,
    // monospace
    monospace_open: alwaysEmptyString,
    monospace_close: alwaysEmptyString,
    // yfmFile
    yfm_file: yfmFile,
};

export {rules, initState};
export default {rules, initState};
