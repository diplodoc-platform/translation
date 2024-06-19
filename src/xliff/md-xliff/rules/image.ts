import MarkdownIt from 'markdown-it';

import {generateCloseG, generateOpenG, generateX} from 'src/xliff/generator';

const decodeURL = new MarkdownIt().utils.lib.mdurl.decode;

export const image = {
  image_open: imageOpen,
  image_close: imageClose,
};

function imageOpen(tokens: Token[], idx: number) {
  const open = tokens[idx];
  if (open.g) {
    const close = open.g;
    const src = close.attrGet('src');
    const title = close.attrGet('title');
    const height = close.attrGet('height');
    const width = close.attrGet('width');

    const begin = '![';
    const end =
      '](' +
      [src && decodeURL(src), title && '"' + title + '"', size(width, height)]
        .filter(Boolean)
        .join(' ') +
      ')';

    return generateOpenG({
      ctype: 'image',
      equivText: `${begin}{{text}}${end}`,
      xBegin: begin,
      xEnd: end,
    });
  } else {
    return generateX({
      ctype: 'image_text_part_open',
      equivText: '![',
    });
  }
}

function imageClose(tokens: Token[], idx: number) {
  const close = tokens[idx];

  if (close.g) {
    return generateCloseG();
  }

  let rendered = '';

  rendered += generateX({
    ctype: 'image_text_part_close',
    equivText: ']',
  });

  rendered += generateX({
    ctype: 'image_attributes_part_open',
    equivText: '(',
  });

  let src = close.attrGet('src');
  if (src?.length) {
    src = decodeURL(src);
    rendered += generateX({
      ctype: 'image_attributes_src',
      equivText: src,
    });
  }

  const title = close.attrGet('title');
  if (title?.length) {
    rendered += generateX({
      ctype: 'image_attributes_title',
      equivText: title,
    });
  }

  const height = close.attrGet('height');
  const width = close.attrGet('width');
  if (width?.length || height?.length) {
    rendered += generateX({
      ctype: 'image_attributes_size',
      equivText: size(width, height),
    });
  }

  rendered += generateX({
    ctype: 'image_attributes_part_close',
    equivText: ')',
  });

  return rendered;
}

function size(width: string | null, height: string | null) {
  if (!width?.length && !height?.length) {
    return '';
  }

  let equivText = '=';

  if (width?.length) {
    equivText += width;
  }

  equivText += 'x';

  if (height?.length) {
    equivText += height;
  }

  return equivText;
}
