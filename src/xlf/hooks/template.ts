export type TemplateParameters = {
    template: [string, string];
};

const fst = <T>([a]: T[]) => a;

const snd = <T>([_, b]: T[]) => b;

function before(parameters: TemplateParameters) {
    return () => fst(parameters.template);
}

function after(parameters: TemplateParameters) {
    return () => snd(parameters.template);
}

export {before, after};

export default {before, after};
