import {yfmFile} from './diplodoc/file';

function generate() {
    return {handlers: handlers()};
}

function handlers() {
    return {
        yfm_file: yfmFile,
    };
}

export {generate};
export default {generate};
