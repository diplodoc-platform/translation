import {text} from './text';

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
