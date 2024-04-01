import Renderer from 'markdown-it/lib/renderer';
import {link} from './link';
import {image} from './image';
import {table} from './table';
import {text} from './text';
import {blockquote} from './blockquote';
import {code} from './code';
import {html} from './html';

export const rules: Renderer.RenderRuleRecord = {
  ...text,
  ...link,
  ...image,
  ...table,
  ...blockquote,
  ...code,
  ...html,
};
