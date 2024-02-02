import type {Token as MdToken} from 'markdown-it';

declare global {
    type Token = MdToken & {
        skip?: string[];
        reflink?: boolean;
    };

    type Env = {
        source: string[];
    };
}
