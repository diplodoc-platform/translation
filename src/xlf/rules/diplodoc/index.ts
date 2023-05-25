export type DiplodocRulesState = {};

function initState() {
    return () => ({});
}

const rules = {
    yfm_note_open: function () {
        return '';
    },
    yfm_note_close: function () {
        return '';
    },
    yfm_note_title_open: function () {
        return '';
    },
    yfm_note_title_close: function () {
        return '';
    },
};

export {rules, initState};
export default {rules, initState};
