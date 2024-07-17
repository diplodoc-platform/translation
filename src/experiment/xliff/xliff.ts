import xmlFormat from 'xml-formatter';

import {TransUnitElement} from './elements/TransUnitElement';
import {attributesToString} from './utils';

interface XliffProps {
  datatype?: string;
}

export class Xliff {
  file = '';
  targetLanguage = '';
  sourceLanguage = '';
  datatype: string;
  skeletonFile?: string;

  transUnits: TransUnitElement[] = [];

  constructor({datatype = 'markdown'}: XliffProps = {}) {
    this.datatype = datatype;
  }

  setFile(path: string) {
    this.file = path;
  }

  setSkeletonFile(path: string) {
    this.skeletonFile = path;
  }

  setSourceLanguage(lang: string) {
    this.sourceLanguage = lang;
  }

  setTargetLanguage(lang: string) {
    this.targetLanguage = lang;
  }

  appendTransUnit(element: TransUnitElement) {
    this.transUnits.push(element);
  }

  toString() {
    if (!this.file) {
      throw new Error('Source file is not set');
    }
    if (!this.sourceLanguage) {
      throw new Error('Source language is not set');
    }
    if (!this.targetLanguage) {
      throw new Error('Target language is not set');
    }

    const data = `<?xml version="1.0" encoding="utf-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file${attributesToString({
    original: this.file,
    'source-language': this.sourceLanguage,
    'target-language': this.targetLanguage,
    datatype: this.datatype,
  })}>
    <header>
      ${
        this.skeletonFile
          ? `<skeleton>
        <external-file${attributesToString({href: this.skeletonFile})}></external-file>
      </skeleton>`
          : ''
      }
    </header>
    <body>
    ${this.transUnits.map((unit) => unit.toString()).join('\n')}
    </body>
  </file>
</xliff>`;

    return xmlFormat(data, {
      collapseContent: true,
      lineSeparator: '\n',
      strictMode: true,
      whiteSpaceAtEndOfSelfclosingTag: true,
    });
  }
}
