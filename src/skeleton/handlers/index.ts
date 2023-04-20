import {text} from './text';
import {linkClose} from './link';

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
        // eslint-disable-next-line camelcase
        link_close: linkClose,
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
