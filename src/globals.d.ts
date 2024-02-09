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
    };

    type Env = {
        source: string[];
    };
}
