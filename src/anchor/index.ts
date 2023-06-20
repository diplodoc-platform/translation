function isAnchor(str: string) {
    return /^\s{1}\{#([^{]+)\}$/gimu.test(str);
}

export {isAnchor};
export default {isAnchor};
