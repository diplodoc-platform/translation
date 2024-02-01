import {render, state} from './renderer/md-xlf';
import {parse} from './parser';
import {generate, generateTransUnit} from './generator';

export type {XLFRenderParams, XLFRenderState} from './renderer/md-xlf/';
export type {TemplateParams, TransUnitParams} from './generator';

export const XLF = {render, parse, generate, generateTransUnit, state};

// export * as generator from './generator';
// export * as parser from './parser';
// export * as translations from './translations';
//
// export * as default from './index';
