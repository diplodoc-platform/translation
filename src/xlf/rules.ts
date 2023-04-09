// blocks(container and leaf) create group
function rules() {
    return {
        code_inline: () => '',
        code_block: () => '',
        fence: () => '',
        image: () => '',
        hardbreak: () => '',
        softbreak: () => '',
        text: () => '',
        html_block: () => '',
        html_inline: () => '',
        heading_open: () => '',
        heading_close: () => '',
        paragraph_open: () => '',
        paragraph_close: () => '',
        bullet_list_open: () => '',
        bullet_list_close: () => '',
        ordered_list_open: () => '',
        ordered_list_close: () => '',
        link_open: () => '',
        link_close: () => '',
        strong_open: () => '',
        strong_close: () => '',
        list_item_open: () => '',
        list_item_close: () => '',
    };
}

export {rules};
export default {rules};
