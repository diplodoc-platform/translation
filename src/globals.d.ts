import type {Token as MdToken} from 'markdown-it';

declare global {
    type Token = MdToken & {
        skip?: string[] | string;
        reflink?: boolean;
        generated?: string;
    };

    type Env = {
        source: string[];
    };
}
