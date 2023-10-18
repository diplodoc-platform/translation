import {imageClose} from './image';
import {yfmFile} from './diplodoc/file';

function generate() {
    return {handlers: handlers()};
}

function handlers() {
    return {
        image_close: imageClose,
        yfm_file: yfmFile,
    };
}

export {generate};
export default {generate};
