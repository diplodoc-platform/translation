function isTitleRefLink(str: string) {
    return /^(\{#T\})$/mu.test(str);
}

export {isTitleRefLink};
export default {isTitleRefLink};
