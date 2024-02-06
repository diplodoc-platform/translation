const always =
    <T>(a: T) =>
    () =>
        a;

const alwaysEmptyString = always('');

export const rules = {
    // notes
    yfm_note_open: alwaysEmptyString,
    yfm_note_close: alwaysEmptyString,
    yfm_note_title_open: alwaysEmptyString,
    yfm_note_title_close: alwaysEmptyString,
    yfm_note_content_open: alwaysEmptyString,
    yfm_note_content_close: alwaysEmptyString,
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
    // checkbox
    checkbox_open: alwaysEmptyString,
    checkbox_input: alwaysEmptyString,
    checkbox_label_open: alwaysEmptyString,
    checkbox_label_close: alwaysEmptyString,
    checkbox_close: alwaysEmptyString,
    // monospace
    monospace_open: alwaysEmptyString,
    monospace_close: alwaysEmptyString,
    // include
    include: alwaysEmptyString,
    // tabs
    tabs_open: alwaysEmptyString,
    tabs_close: alwaysEmptyString,
    'tab-list_open': alwaysEmptyString,
    'tab-list_close': alwaysEmptyString,
    tab_open: alwaysEmptyString,
    tab_close: alwaysEmptyString,
    'tab-panel_open': alwaysEmptyString,
    'tab-panel_close': alwaysEmptyString,
    // anchors
    span_open: alwaysEmptyString,
    span_close: alwaysEmptyString,
    // table
    yfm_tbody_open: alwaysEmptyString,
    yfm_tbody_close: alwaysEmptyString,
    yfm_table_open: alwaysEmptyString,
    yfm_table_close: alwaysEmptyString,
    yfm_tr_open: alwaysEmptyString,
    yfm_tr_close: alwaysEmptyString,
    yfm_td_open: alwaysEmptyString,
    yfm_td_close: alwaysEmptyString,
};
