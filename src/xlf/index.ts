import {render, state} from './renderer/md-xlf';
import {parse} from './parser';
import {generate, generateTransUnit} from './generator';

export type {XLFRenderParams, XLFRenderState} from './renderer/md-xlf/';
export type {TemplateParams, TransUnitParams} from './generator';

export const XLF = {render, parse, generate, generateTransUnit, state};
