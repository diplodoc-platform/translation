import type {Token as MdToken} from 'markdown-it';
import type {TokenSubType} from './liquid/token';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Hash<T = any> = Record<string, T>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Container<T = any> = Record<string | symbol, T>;

    type Token = MdToken & {
        skip?: string[] | string;
        linebreak?: boolean;
        reflink?: boolean;
        fake?: boolean;
        generated?: string;
        isInlineCode?: boolean;
        subtype?: TokenSubType;
        g?: Token;
        open?: Token;
        erule?: (consumer: Consumer, tokens: Token[], idx: number, pos: [number, number]) => void;
        beforeDrop?: (consumer: Consumer, prev: Token, next: Token) => void;
    };

    type Env = {
        source: string[];
    };
}
