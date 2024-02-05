import type {Token as MdToken} from 'markdown-it';

declare global {
    type Token = MdToken & {
        skip?: string[] | string;
        reflink?: boolean;
        fake?: boolean;
        generated?: string;
        subtype?: string;
    };

    type Env = {
        source: string[];
    };
}
