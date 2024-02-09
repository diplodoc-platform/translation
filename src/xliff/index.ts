import {render} from './renderer/md-xliff';
import {parse} from './parser';
import {generate, generateTransUnit} from './generator';

export type {XLFRenderParams, XLFRenderState} from './renderer/md-xliff/';
export type {TemplateParams, TransUnitParams} from './generator';

export const XLF = {render, parse, generate, generateTransUnit};
