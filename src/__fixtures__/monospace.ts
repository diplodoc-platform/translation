const markdown = `\
##моноспейс##
вот ##это## моно**спейс** хе##хе##хе
[привет ##мир## мне ##хорошо##](href "подсказка")
`;

const skeleton = `\
##%%%1%%%##
%%%2%%% ##%%%3%%%## %%%4%%%**%%%5%%%** %%%6%%%##%%%7%%%##%%%8%%%
[%%%9%%% ##%%%10%%%## %%%11%%% ##%%%12%%%##](href "%%%13%%%")
`;

const translations = new Map<string, string>([
    ['1', 'monospace'],
    ['2', 'this'],
    ['3', 'is'],
    ['4', 'mono'],
    ['5', 'space'],
    ['6', 'he'],
    ['7', 'he'],
    ['8', 'he'],
    ['9', 'hello'],
    ['10', 'world'],
    ['11', "i'm"],
    ['12', 'fine'],
    ['13', 'hint'],
]);

export {markdown, skeleton, translations};
export default {markdown, skeleton, translations};
