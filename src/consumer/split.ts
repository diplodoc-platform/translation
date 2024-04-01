import {sentenize} from '@diplodoc/sentenizer';
import {eruler, firstContentful, gobble, lastContentful} from 'src/consumer/utils';
import {token} from 'src/utils';

const hasContent = (token: Token) => token.content || (token.markup && !token.skip);

export function trim(part: Token[]) {
  const [first, iFirst] = firstContentful(part);
  if (first) {
    part[iFirst] = token(first.type, {
      ...first,
      content: first.content.trimStart(),
      generated: (first.generated || '') + '|trimStart',
    });
  }

  const [last, iLast] = lastContentful(part);
  if (last) {
    part[iLast] = token(last.type, {
      ...last,
      content: last.content.trimEnd(),
      generated: (last.generated || '') + '|trimEnd',
    });
  }

  return part;
}

function exclude(content: string, tokens: Token[]) {
  const part = trim(tokens.filter(hasContent));
  const [, to] = eruler(content, [0, content.length], part, gobble);

  return content.slice(to);
}

/**
 * Split inline tokens sequence on parts,
 * where each part is equal to one sentense of inline fragment.
 * Trim useless spaces.
 *
 * Some **sentense**. Other sentense.
 * ^--------------------------------^ inline fragment
 * 1---1223------3445---------------5 tokens
 * ^----------------^ ^-------------^ sentenses
 *
 * So sentense one contains tokens from 1 to 4 and part of 5.
 * Sentense two contains only part of 5 token.
 */
export function split(tokens: Token[]) {
  const parts: Token[][] = [];
  let content = '';
  let part: Token[] = [];

  const add = (token: Token | null) =>
    token && (token.content || token.skip || token.markup) && part.push(token);
  const release = () => {
    if (part.length) {
      parts.push(trim(part));
      part = [];
      content = '';
    }
  };

  for (const _token of tokens) {
    if (hasContent(_token)) {
      content += _token.content || _token.markup || '';
    }

    const segments = sentenize(content);

    if (segments.length < 2) {
      add(_token);

      continue;
    }

    // Here we have at minimum one full segment (head) and one incomplete (rest).
    // But we can have more that two, if last token consists big text sequence.

    const [head, full, rest] = [segments.shift(), segments, segments.pop()];

    add(
      token('text', {
        content: exclude(head as string, part).trimEnd(),
        generated: 'head',
      }),
    );
    release();

    for (const segment of full) {
      add(
        token('text', {
          content: segment.trim(),
          generated: 'leaf',
        }),
      );
      release();
    }

    content = rest || '';
    add(
      token(_token.type, {
        ..._token,
        content: content.trim() ? content : _token.content,
        generated: 'rest',
      }),
    );
  }

  release();

  return parts;
}
