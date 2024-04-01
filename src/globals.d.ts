import type {Token as MdToken} from 'markdown-it';
import type {TokenSubType} from './liquid/token';

declare global {
  type Token = MdToken & {
    skip?: string[] | string;
    reflink?: boolean;
    fake?: boolean;
    generated?: string;
    subtype?: TokenSubType;
    g?: Token;
    open?: Token;
    erule?: (consumer: Consumer, tokens: Token[], idx: number, pos: [number, number]) => void;
    beforeDrop?: (consumer: Consumer, prev: Token, next: Token) => void;
  };

  type Env = {
    source: string[];
  };

  type FileInfo<T> = {
    path: string;
    data: T;
  };
}
