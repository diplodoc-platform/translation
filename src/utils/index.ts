import MdIt from 'markdown-it';

const md = new MdIt();
const state = new md.core.State('', md, {});

export function token(type: string, props: Record<string, any> = {}) {
  return Object.assign(new state.Token(type, '', 0), props);
}

export function replace(source: string, units: string[]): [string, boolean] {
  let matched = false;

  const result = source.replace(/%%%(\d+)%%%/g, (_, id: string | number) => {
    matched = true;
    id = Number(id);

    if (!units[id]) {
      throw new Error('Translation token not found.');
    }

    let [value, submatch] = replace(units[id], units);
    while (submatch) {
      [value, submatch] = replace(value, units);
    }

    return value;
  });

  return [result, matched];
}

const getPadLeft = (string: string) => {
  const match = /^\n*([^\n\S]+)\S+/m.exec(string);

  return match ? match[1].length : null;
};

const getPadRight = (string: string, pad: number | null) => {
  const match = /\n([^\n\S]+?)$/g.exec(string);

  return match ? match[1].length - (pad || 0) : 0;
};

const joinVars = (strings: string[], vars: string[]) => {
  const result = [];

  while (strings.length) {
    result.push(strings.shift());

    if (vars.length) {
      result.push(vars.shift());
    }
  }

  return result;
};

export function trim(string: TemplateStringsArray | string[] | string, ...vars: any[]): string {
  let result = '';

  string = joinVars(([] as string[]).concat(string as string[]), vars) as string[];

  let pad: number | null = null;
  for (let index = 0; index < string.length; index++) {
    const isVar = Boolean(index % 2);

    let content = String(string[index]);

    if (isVar) {
      content = trim(content);
      content = offset(content, getPadRight(string[index - 1], pad));
      result += content;
    } else {
      while (content.length) {
        const currNewline = content.indexOf('\n') + 1;
        const nextNewline = content.indexOf('\n', currNewline) + 1;
        if (currNewline > 0) {
          if (pad === null) {
            pad = getPadLeft(content.slice(currNewline));
          }

          const currPad = pad !== null && nextNewline - currNewline >= pad ? pad : 0;

          result += content.slice(0, currNewline);
          content = content.slice(currNewline + currPad);
        } else {
          result += content;
          content = '';
        }
      }
    }
  }

  return result.trim();
}

function offset(string: string, pad: number) {
  return string.replace(/^/gm, ' '.repeat(pad)).slice(pad);
}
