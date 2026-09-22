import {describe, expect, it} from 'vitest';

import {extract} from 'src/api';
import {CodeProcessing} from 'src/consumer';

/**
 * Units of a fenced block in the adaptive mode: comments the scanner found
 * and placeholders. A marker inside a literal must never produce a unit.
 */
function units(lang: string, code: string) {
    const markdown = '```' + lang + '\n' + code + '\n```\n';
    const {units} = extract(markdown, {
        compact: true,
        code: CodeProcessing.ADAPTIVE,
        source: {language: 'ru', locale: 'RU'},
        target: {language: 'en', locale: 'US'},
    });

    return units.map((unit) =>
        unit
            .replace(/<source[^>]*>(.*)<\/source>/s, '$1')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&'),
    );
}

type Case = [title: string, lang: string, code: string, expected: string[]];

const cases: Case[] = [
    // javascript / typescript
    [
        'double-quoted string',
        'ts',
        'const v = "prefix // human words"; // комментарий',
        ['комментарий'],
    ],
    ['string after an arrow', 'ts', 'const v=()=>"prefix // human words"', []],
    ['tagged template', 'ts', 'const v=html`prefix // human words`', []],
    [
        'escaped single quote',
        'ts',
        "const v = 'prefix \\' // human words'; // экранирование",
        ['экранирование'],
    ],
    [
        'template across lines',
        'ts',
        'const t = `\nprefix // human words\n`; // после литерала',
        ['после литерала'],
    ],
    [
        'tagged template across lines',
        'ts',
        'const t = html`\n<b>// human words</b>\n`; // после тега',
        ['после тега'],
    ],
    ['url in a string', 'ts', "const u = 'https://a'; // адрес", ['адрес']],
    ['regex with escaped slashes', 'ts', 'const re = /https?:\\/\\//; // регулярка', ['регулярка']],
    ['division is not a comment', 'ts', 'const x = a / b / c; // деление', ['деление']],
    ['empty string', 'ts', 'const e = ""; // пустая строка', ['пустая строка']],
    ['adjacent strings', 'ts', "const s = 'it' + 's'; // рядом", ['рядом']],
    ['escaped backslash before the quote', 'ts', 'const s = "a\\\\"; // слеш', ['слеш']],
    [
        'unterminated one-line string resets',
        'ts',
        'const s = "oops // hidden\nconst t = 1; // следующая строка',
        ['следующая строка'],
    ],
    [
        'unterminated apostrophe is not a literal',
        'ts',
        "const s = 'oops // комментарий",
        ['комментарий'],
    ],
    ['apostrophe inside double quotes', 'ts', 'const t = "it\'s"; // апостроф', ['апостроф']],
    [
        'quotes inside the comment',
        'ts',
        '// комментарий с "кавычками" и \'апострофами\'',
        ['комментарий с "кавычками" и \'апострофами\''],
    ],
    ['char literal', 'ts', "const c = '/'; // символ", ['символ']],
    ['jsonc value with a marker', 'jsonc', '"color": "#fff", // цвет', ['цвет']],
    ['inch mark does not open a string', 'js', 'const size = 10" // дюймы', ['дюймы']],
    // java, kotlin
    [
        'text block across lines',
        'java',
        'String s = """\nprefix // human words\n"""; // текстовый блок',
        ['текстовый блок'],
    ],
    ['char with a slash', 'java', "char c = '/'; // символ", ['символ']],
    // go, rust
    [
        'raw string across lines',
        'go',
        's := `\nprefix // human words\n` // сырая строка',
        ['сырая строка'],
    ],
    ['rune', 'go', "r := '/' // руна", ['руна']],
    [
        'lifetimes are not strings',
        'rust',
        "fn f<'a>(x: &'a str) {} // время жизни",
        ['время жизни'],
    ],
    ['char with a quote', 'rust', "let c = '\"'; // символ", ['символ']],
    ['string with an apostrophe', 'rust', 'let s = "it\'s // not"; // строка', ['строка']],
    // python
    ['escaped quote', 'python', "s = 'it\\'s # human words'  # экранирование", ['экранирование']],
    ['f-string', 'python', "s = f'{x} # human words'  # f-строка", ['f-строка']],
    ['bytes prefix', 'python', "s = rb'\\d # x'  # префикс", ['префикс']],
    [
        'docstring across lines',
        'python',
        'text = """\nprefix # human words\n"""  # докстринг',
        ['докстринг'],
    ],
    [
        'single quoted docstring',
        'python',
        "text = '''\nprefix # human words\n'''  # докстринг",
        ['докстринг'],
    ],
    ['adjacent literals', 'python', "s = 'a' 'b'  # соседние", ['соседние']],
    ['empty literal', 'python', "s = ''  # пустая", ['пустая']],
    ['marker as a dict key', 'python', "d = {'#': 1}  # словарь", ['словарь']],
    ['contraction in a string', 'python', 's = "don\'t"  # апостроф', ['апостроф']],
    ['contraction in the comment', 'python', "x = a if b else c  # it's fine", ["it's fine"]],
    [
        'unterminated one-line string resets',
        'python',
        's = "oops # hidden\nprint(x)  # выводим',
        ['выводим'],
    ],
    // yaml
    ['doubled quote', 'yaml', "value: 'it''s # human words' # комментарий", ['комментарий']],
    ['double-quoted value', 'yaml', 'value: "prefix # human words" # комментарий', ['комментарий']],
    ['apostrophe in a plain scalar', 'yaml', "title: it's fine # апостроф", ['апостроф']],
    [
        'possessive in a plain scalar',
        'yaml',
        "owner: users' guide # притяжательный",
        ['притяжательный'],
    ],
    ['color in single quotes', 'yaml', "color: '#fff' # цвет", ['цвет']],
    ['color in double quotes', 'yaml', 'color: "#fff" # цвет', ['цвет']],
    ['anchor in a url', 'yaml', 'url: http://a/#x # адрес', ['адрес']],
    ['empty value', 'yaml', "empty: '' # пусто", ['пусто']],
    ['flow sequence', 'yaml', 'list: [\'a # b\', "c"] # поток', ['поток']],
    [
        'apostrophe in double quotes',
        'yaml',
        'key: "it\'s" # апостроф в кавычках',
        ['апостроф в кавычках'],
    ],
    [
        'double-quoted scalar across lines',
        'yaml',
        'text: "line one\n  # not a comment\n  end" # хвост',
        ['хвост'],
    ],
    [
        'single-quoted scalar across lines',
        'yaml',
        "text: 'line one\n  # not a comment\n  end' # хвост",
        ['хвост'],
    ],
    [
        'block scalar',
        'yaml',
        'value: |\n  prefix # human words\n\n  # тоже внутри\nnext: 1 # комментарий',
        ['комментарий'],
    ],
    [
        'folded block scalar in a list',
        'yaml',
        'list:\n  - >-\n    prefix # human words\n  - item # элемент',
        ['элемент'],
    ],
    [
        'comment after the block indicator',
        'yaml',
        'key: | # индикатор\n  prefix # human words',
        ['индикатор'],
    ],
    [
        'block scalar with an indentation indicator',
        'yaml',
        'key: |2-\n  prefix # human words\nnext: 1 # дальше',
        ['дальше'],
    ],
    [
        'pipe inside a value is not a block scalar',
        'yaml',
        'cmd: a | b # конвейер\nnext: c # дальше',
        ['конвейер', 'дальше'],
    ],
    [
        'placeholder inside a string stays a placeholder',
        'yaml',
        'token: "<ваш токен>" # секрет',
        ['ваш токен', 'секрет'],
    ],
    // sql, yql
    ['doubled quote', 'sql', "select 'it''s -- human words' -- комментарий", ['комментарий']],
    ['quoted identifier', 'sql', 'select "a--b" -- идентификатор', ['идентификатор']],
    ['string across lines', 'sql', "select 'line\n-- not a comment\n' -- хвост", ['хвост']],
    ['escape string prefix', 'sql', "select E'it\\'s -- x' -- постгрес", ['постгрес']],
    ['unicode string prefix', 'tsql', "select N'it -- x' -- юникод", ['юникод']],
    ['contraction in the comment', 'sql', "select 'a' -- it's ok", ["it's ok"]],
    ['empty string', 'sql', "select '' -- пустая", ['пустая']],
    [
        'second marker inside the comment',
        'sql',
        'select x -- comment -- с двойным маркером',
        ['comment -- с двойным маркером'],
    ],
    ['backslash escape', 'yql', "select 'it\\'s -- x' -- экранирование", ['экранирование']],
    ['generic is not a placeholder', 'yql', '$s = AsStruct(1 AS a); -- Struct<a:Int32>', []],
    // shell
    [
        'command substitution in a string',
        'bash',
        'echo "$(date) # not a comment" # комментарий',
        ['комментарий'],
    ],
    ['adjacent literals', 'bash', "echo 'it''s # x' # соседние литералы", ['соседние литералы']],
    ['escaped double quote', 'bash', 'echo "a\\"b # c" # экранирование', ['экранирование']],
    ['no escapes in single quotes', 'bash', "echo 'a\\' # комментарий", ['комментарий']],
    [
        'heredoc',
        'bash',
        'cat <<EOF\n# внутри heredoc\ntext\nEOF\necho done # после heredoc',
        ['после heredoc'],
    ],
    [
        'heredoc with a quoted terminator and dash',
        'bash',
        "cat <<-'EOF'\n\t# внутри\n\tEOF\n# снаружи",
        ['снаружи'],
    ],
    [
        'comment on the heredoc line',
        'bash',
        'cat << EOF # комментарий на строке heredoc\n# внутри\nEOF',
        ['комментарий на строке heredoc'],
    ],
    [
        'heredoc operator inside a string',
        'bash',
        'echo "<<EOF" # не heredoc\n# следующая строка',
        ['не heredoc', 'следующая строка'],
    ],
    ['parameter expansion', 'bash', 'echo ${#arr} # длина', ['длина']],
    [
        'double-quoted string across lines',
        'bash',
        'echo "line\n# внутри строки\n" # после',
        ['после'],
    ],
    [
        'quotes inside the comment',
        'bash',
        "# комментарий с 'апострофом'",
        ["комментарий с 'апострофом'"],
    ],
    ['contraction in the comment', 'bash', "git commit -m 'msg' # it's ok", ["it's ok"]],
    [
        'placeholder inside a string',
        'bash',
        'curl -H "Authorization: OAuth <токен>" # запрос',
        ['токен', 'запрос'],
    ],
    ['dockerfile is shell-like', 'dockerfile', 'RUN echo "a # b" # комментарий', ['комментарий']],
    // php, ruby, perl
    ['heredoc', 'php', '$s = <<<EOT\n# внутри\nEOT;\n// после', ['после']],
    ['escaped single quote', 'php', "$s = 'it\\'s // x'; // экранирование", ['экранирование']],
    ['heredoc', 'ruby', 's = <<~EOS\n# внутри\nEOS\n# после', ['после']],
    [
        'append is not a heredoc',
        'ruby',
        'arr << item # добавление\n# дальше',
        ['добавление', 'дальше'],
    ],
    ['string across lines', 'perl', 'my $s = "line\n# внутри\n"; # после', ['после']],
    // more corners
    [
        'conditional with strings',
        'python',
        "s = 'a' if x else 'b # c'  # комментарий",
        ['комментарий'],
    ],
    ['nested quotes in an f-string', 'python', 'f"{a[\'b\']} # x"  # комментарий', ['комментарий']],
    ['escaped char literal', 'c', "char c = '\\''; // кавычка", ['кавычка']],
    ['raw string', 'rust', 'let s = r#"raw // x"#; // сырая', ['сырая']],
    ['interpolation', 'ruby', 's = "#{x} # not" # комментарий', ['комментарий']],
    ['sed with mixed quotes', 'bash', 'sed "s/\'/\\"/g" file # замена', ['замена']],
    [
        'nested block scalar in a list',
        'yaml',
        '  - name: x\n    script: |\n      # inside\n  - name: y # элемент',
        ['элемент'],
    ],
    ['folded scalar', 'yaml', 'text: >\n  folded # inside\nnext: 1 # дальше', ['дальше']],
    ['string then backtick', 'go', 's := "a" + `b // c` + "d" // хвост', ['хвост']],
    ['jsx attribute', 'tsx', 'const a = <a href="//cdn" />; // ссылка', ['ссылка']],
    ['apostrophe in an ini value', 'ini', "key = it's # комментарий", ['комментарий']],
    // lua, toml, ini, haskell, go
    ['escaped quote', 'lua', "s = 'it\\'s -- x' -- экранирование", ['экранирование']],
    ['string with a marker', 'toml', 'key = "a # b" # комментарий', ['комментарий']],
    ['literal string with a backslash', 'toml', "path = 'C:\\dir' # литерал", ['литерал']],
    ['multi-line basic string', 'toml', 'text = """\n# not a comment\n""" # после', ['после']],
    ['semicolon comment', 'ini', 'key = "a ; b" ; комментарий', ['комментарий']],
    ['prime is not a quote', 'haskell', "x' = 1 -- штрих", ['штрих']],
    ['apostrophe in the comment', 'go', 's := "a" // it\'s fine', ["it's fine"]],
];

describe('code: literals and comment markers', () => {
    it.each(cases)('%s (%s)', (_title, lang, code, expected) => {
        expect(units(lang, code)).toEqual(expected);
    });
});
