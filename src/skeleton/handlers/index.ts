import {text} from './text';
import {linkClose} from './link';
import {imageClose} from './image';

export type SkeletonHandlersState = {
    skeleton: {
        id: number;
    };
};

function generate() {
    return {handlers: handlers(), initState: initState()};
}

function handlers() {
    return {
        text,
        link_close: linkClose,
        image_close: imageClose,
    };
}

function initState() {
    return () => ({
        skeleton: {
            id: 1,
        },
    });
}

export {generate};
export default {generate};
