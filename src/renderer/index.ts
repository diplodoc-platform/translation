import MarkdownIt, {Options} from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

export enum CustomRendererLifeCycle {
    BeforeRender,
    AfterRender,
    BeforeInlineRender,
    AfterInlineRender,
}

function isCustomRendererLifeCycle(cycle: unknown): cycle is CustomRendererLifeCycle {
    return Object.keys(CustomRendererLifeCycle).includes(
        cycle as keyof typeof CustomRendererLifeCycle,
    );
}

export type CustomRendererParams<S = {}> = {
    hooks?: CustomRendererHooks;
    rules?: Renderer.RenderRuleRecord;
    state?: S;
};

export type CustomRendererHooks = Record<string, CustomRendererHook | CustomRendererHook[]>;

export interface CustomRendererHook {
    (parameters: CustomRendererHookParameters): string;
}

export type CustomRendererHookParameters = {
    tokens: Token[];
    options: Options;
    env: unknown;
    map?: [number, number] | null;
    // accumulates render artifacts inside the inline render
    rendered?: string[];
};

type SourceMap = [number, number];

function getMap(tokens: Token[], i: number) {
    let depth = 0;
    while (tokens[i]) {
        const token = tokens[i--];

        depth += token.nesting;

        if (token.map && depth >= 0) {
            return token.map;
        }
    }

    return null;
}

export class CustomRenderer<State = {}, Md extends MarkdownIt = MarkdownIt> extends Renderer {
    readonly state: State;

    readonly md: Md;

    protected hooks: Map<CustomRendererLifeCycle, CustomRendererHook[]>;

    constructor(
        {hooks = {}, rules = {}, state = {} as State}: CustomRendererParams<State>,
        parser: Md,
    ) {
        super();

        this.setRules(rules);

        this.md = parser;
        this.state = state;

        this.hooks = new Map<CustomRendererLifeCycle, CustomRendererHook[]>();
        this.setHooks({...hooks});
    }

    setRules(rules: Renderer.RenderRuleRecord) {
        for (const [name, rule] of Object.entries(rules)) {
            if (!rule || !name?.length) {
                continue;
            }

            this.rules[name] = rule.bind(this);
        }
    }

    setHooks(hooks: CustomRendererHooks) {
        for (const [name, hook] of Object.entries(hooks)) {
            if (isCustomRendererLifeCycle(name)) {
                this.hook(parseInt(name, 10), hook);
            }
        }
    }

    hook(cycle: CustomRendererLifeCycle, hook: CustomRendererHook | CustomRendererHook[]) {
        const hooks = this.hooks.get(cycle) ?? [];

        const normalized = (Array.isArray(hook) ? hook : [hook]).map((h) => h.bind(this));

        this.hooks.set(cycle, [...hooks, ...normalized]);
    }

    render(tokens: Token[], options: Options, env: unknown) {
        let rendered = '';

        let children;
        let type;
        let map;
        let len;
        let i;

        const parameters = {tokens, options, env};

        rendered += this.runHooks(CustomRendererLifeCycle.BeforeRender, parameters);

        for (i = 0, len = tokens.length; i < len; i++) {
            type = tokens[i].type;
            children = tokens[i].children;
            map = getMap(tokens, i - 1);

            if (type === 'inline' && Array.isArray(children)) {
                rendered += this.renderInline(children, options, env, map, tokens[i]);

                continue;
            }

            rendered += this.processToken(tokens, i, options, env);
        }

        rendered += this.runHooks(CustomRendererLifeCycle.AfterRender, parameters);

        return rendered;
    }

    // @ts-ignore
    renderInline(
        tokens: Token[],
        options: Options,
        env: unknown,
        map: SourceMap | null,
        inline: Token,
    ) {
        const rendered: string[] = [];
        const parameters = {tokens, options, env, rendered, map, inline};

        rendered.push(this.runHooks(CustomRendererLifeCycle.BeforeInlineRender, parameters));

        for (let i = 0; i < tokens.length; i++) {
            rendered.push(this.processToken(tokens, i, options, env));
        }

        rendered.push(this.runHooks(CustomRendererLifeCycle.AfterInlineRender, parameters));

        return rendered.join('');
    }

    // renderInline provides rendered array
    // we accumulate render results into it
    // allowing us to access current render artifacts
    // at the time each before/after inline render hook runs
    runHooks(cycle: CustomRendererLifeCycle, parameters: CustomRendererHookParameters) {
        const hooks = this.hooks.get(cycle) ?? [];

        let rendered = '';
        let result = '';

        for (const hook of hooks) {
            result = hook(parameters);

            if (Array.isArray(parameters.rendered)) {
                parameters.rendered.push(result);
            } else {
                rendered += result;
            }
        }

        return Array.isArray(parameters.rendered) ? '' : rendered;
    }

    processToken(tokens: Token[], i: number, options: Options, env: unknown) {
        let rendered = '';

        const type = tokens[i].type;
        const rule = this.rules[type];

        if (rule) {
            // @ts-ignore
            rendered += rule(tokens, i, options, env, this);
        } else {
            rendered += this.renderToken(tokens, i, options);
        }

        return rendered;
    }
}

export function customRenderer<State = {}, Md extends MarkdownIt = MarkdownIt>(
    parser: Md,
    parameters: CustomRendererParams<State> = {},
) {
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    parser.renderer = new CustomRenderer<State, Md>(parameters, parser);
}
