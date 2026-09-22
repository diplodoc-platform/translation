import {describe, expect, it} from 'vitest';
import {dedent} from 'ts-dedent';

import {compose, extract} from 'src/api';
import {CodeProcessing} from 'src/consumer';

import {isProse} from './comments';

const languages = {
    source: {language: 'ru', locale: 'RU'},
    target: {language: 'en', locale: 'US'},
} as const;

function decode(text: string) {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
}

function encode(text: string) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function run(markdown: string) {
    const {units, skeleton, xliff} = extract(markdown, {
        compact: true,
        code: CodeProcessing.ADAPTIVE,
        ...languages,
    });

    return {
        skeleton,
        xliff,
        units: units.map((unit) => decode(unit.replace(/<source[^>]*>(.*)<\/source>/s, '$1'))),
    };
}

function translate(xliff: string, dictionary: Record<string, string>) {
    return xliff.replace(/(<source[^>]*>(.*?)<\/source>)/g, (_, source, text) => {
        const target = dictionary[decode(text)];

        if (!target) {
            throw new Error(`No translation for "${text}"`);
        }

        return `${source}\n        <target>${encode(target)}</target>`;
    });
}

describe('code: comments in fenced code blocks', () => {
    it('extracts hash comments from yaml and keeps commented-out keys', () => {
        const markdown = dedent`
            \`\`\`yaml
            # Клиентская часть
            bus_client:
              encryption_mode: required # обязательное шифрование
              # verification_mode: full
              color: "#fff3e0"

            # Серверная часть
            bus_server:
              ca:
                file_name: /etc/yt/certs/ca.pem
            \`\`\`
        `;

        const {units, skeleton, xliff} = run(markdown);

        expect(units).toEqual(['Клиентская часть', 'обязательное шифрование', 'Серверная часть']);
        expect(skeleton).toBe(dedent`
            \`\`\`yaml
            # %%%0%%%
            bus_client:
              encryption_mode: required # %%%1%%%
              # verification_mode: full
              color: "#fff3e0"

            # %%%2%%%
            bus_server:
              ca:
                file_name: /etc/yt/certs/ca.pem
            \`\`\`
        `);
        expect(compose(skeleton, xliff, {useSource: true})).toBe(markdown);

        const translated = translate(xliff, {
            'Клиентская часть': 'Client side',
            'обязательное шифрование': 'encryption is required',
            'Серверная часть': 'Server side',
        });

        expect(compose(skeleton, translated, {useSource: false})).toBe(dedent`
            \`\`\`yaml
            # Client side
            bus_client:
              encryption_mode: required # encryption is required
              # verification_mode: full
              color: "#fff3e0"

            # Server side
            bus_server:
              ca:
                file_name: /etc/yt/certs/ca.pem
            \`\`\`
        `);
    });

    it('extracts hash comments from python, toml, ini and dockerfile', () => {
        const markdown = dedent`
            \`\`\`python
            # Загружаем конфиг
            config = load()  # из файла
            # print(config)
            \`\`\`

            \`\`\`toml
            # Секция сервера
            [server]
            port = 8080 # порт
            \`\`\`

            \`\`\`ini
            ; Настройки
            # Секция клиента
            [client]
            \`\`\`

            \`\`\`dockerfile
            # Базовый образ
            FROM ubuntu:22.04
            \`\`\`
        `;

        const {units, skeleton} = run(markdown);

        expect(units).toEqual([
            'Загружаем конфиг',
            'из файла',
            'Секция сервера',
            'порт',
            'Настройки',
            'Секция клиента',
            'Базовый образ',
        ]);
        expect(skeleton).toContain('config = load()  # %%%1%%%');
        expect(skeleton).toContain('# print(config)');
        expect(skeleton).toContain('; %%%4%%%');
        expect(skeleton).toContain('FROM ubuntu:22.04');
    });

    it('extracts double-slash comments and keeps urls and commented-out statements', () => {
        const markdown = dedent`
            \`\`\`ts
            // Настройки клиента
            const url = 'https://example.com'; // адрес сервера
            // const retries = 3;
            // TODO: вынести в конфиг
            \`\`\`

            \`\`\`go
            // Точка входа
            func main() {} // ничего не делает
            \`\`\`

            \`\`\`proto
            // Сообщение запроса
            message Request {}
            \`\`\`
        `;

        const {units, skeleton, xliff} = run(markdown);

        expect(units).toEqual([
            'Настройки клиента',
            'адрес сервера',
            'TODO: вынести в конфиг',
            'Точка входа',
            'ничего не делает',
            'Сообщение запроса',
        ]);
        expect(skeleton).toContain("const url = 'https://example.com'; // %%%1%%%");
        expect(skeleton).toContain('// const retries = 3;');
        expect(compose(skeleton, xliff, {useSource: true})).toBe(markdown);
    });

    it('extracts double-dash comments from sql and lua', () => {
        const markdown = dedent`
            \`\`\`sql
            -- Выбираем всех пользователей
            SELECT * FROM users; -- без фильтра
            -- SELECT * FROM admins;
            \`\`\`

            \`\`\`lua
            -- Локальная переменная
            local x = 1 -- счётчик
            \`\`\`
        `;

        const {units, skeleton} = run(markdown);

        expect(units).toEqual([
            'Выбираем всех пользователей',
            'без фильтра',
            'Локальная переменная',
            'счётчик',
        ]);
        expect(skeleton).toContain('-- SELECT * FROM admins;');
    });

    it('keeps placeholders and comments together in bash', () => {
        const markdown = dedent`
            \`\`\`bash
            # Клиентская часть
            export TOKEN=<ваш токен> # подсказка
            # export TOKEN=<старый токен>
            yt list //home
            \`\`\`
        `;

        const {units, skeleton, xliff} = run(markdown);

        expect(units).toEqual(['Клиентская часть', 'ваш токен', 'подсказка', 'старый токен']);
        expect(skeleton).toBe(dedent`
            \`\`\`bash
            # %%%0%%%
            export TOKEN=<%%%1%%%> # %%%2%%%
            # export TOKEN=<%%%3%%%>
            yt list //home
            \`\`\`
        `);
        expect(compose(skeleton, xliff, {useSource: true})).toBe(markdown);
    });

    it('strips repeated markers and decorations around the comment text', () => {
        const markdown = dedent`
            \`\`\`yaml
            ## Секция
            # --- Клиент ---
            # ... и остальное
            # ======
            #
            key: value
            \`\`\`
        `;

        const {units, skeleton} = run(markdown);

        expect(units).toEqual(['Секция', 'Клиент', 'и остальное']);
        expect(skeleton).toBe(dedent`
            \`\`\`yaml
            ## %%%0%%%
            # --- %%%1%%% ---
            # ... %%%2%%%
            # ======
            #
            key: value
            \`\`\`
        `);
    });

    it('works for fences inside list items', () => {
        const markdown = dedent`
            - Пункт

              \`\`\`yaml
              # Клиентская часть
              bus_client:
                ca: /etc/ca.pem # сертификат
              \`\`\`
        `;

        const {units, skeleton, xliff} = run(markdown);

        expect(units).toEqual(['Пункт', 'Клиентская часть', 'сертификат']);
        expect(skeleton).toBe(dedent`
            - %%%0%%%

              \`\`\`yaml
              # %%%1%%%
              bus_client:
                ca: /etc/ca.pem # %%%2%%%
              \`\`\`
        `);
        expect(compose(skeleton, xliff, {useSource: true})).toBe(markdown);
    });

    it('keeps liquid variables inside code intact', () => {
        const markdown = dedent`
            \`\`\`yaml
            # Хост {{host}}
            host: {{host}} # адрес
            \`\`\`
        `;

        const {units, skeleton, xliff} = run(markdown);

        expect(units).toEqual(['Хост {{host}}', 'адрес']);
        expect(skeleton).toBe(dedent`
            \`\`\`yaml
            # %%%0%%%
            host: {{host}} # %%%1%%%
            \`\`\`
        `);
        expect(compose(skeleton, xliff, {useSource: true})).toBe(markdown);
    });

    it('extracts only placeholders from languages without a known comment syntax', () => {
        const markdown = dedent`
            \`\`\`text
            # Не комментарий
            value: <значение>
            \`\`\`

            \`\`\`json
            {"key": "<значение>"} // не комментарий
            \`\`\`
        `;

        const {units, skeleton} = run(markdown);

        expect(units).toEqual(['значение', 'значение']);
        expect(skeleton).toContain('# Не комментарий');
        expect(skeleton).toContain('// не комментарий');
    });

    it('reads the language after spaces and tabs in the info string', () => {
        const markdown =
            '``` yaml\n# Секция\nkey: value\n```\n\n```\tyaml\t\n# Раздел\nkey: value\n```\n';

        expect(run(markdown).units).toEqual(['Секция', 'Раздел']);
    });

    it('knows semicolon comments of ini, dashes of yql and both markers of hcl', () => {
        const markdown = dedent`
            \`\`\`ini
            ; Секция клиента
            [client]
            host = a ; адрес
            \`\`\`

            \`\`\`yql
            -- Выборка
            SELECT 1;
            \`\`\`

            \`\`\`hcl
            # Провайдер
            provider "aws" {} // регион
            \`\`\`
        `;

        expect(run(markdown).units).toEqual([
            'Секция клиента',
            'адрес',
            'Выборка',
            'Провайдер',
            'регион',
        ]);
    });

    it('does not take tags of markup languages for placeholders', () => {
        const markdown = dedent`
            \`\`\`html
            <div class="a"><b>Текст</b></div>
            \`\`\`

            \`\`\`xml
            <config><host>localhost</host></config>
            \`\`\`

            \`\`\`tsx
            // Кнопка
            const button = <Button>Текст</Button>;
            \`\`\`
        `;

        expect(run(markdown).units).toEqual(['Кнопка']);
    });

    it('keeps comments that start with a placeholder and drops enumerators', () => {
        const markdown = dedent`
            \`\`\`bash
            # <worker> - адрес воркера, например "[IPv6]:port"
            # 1. Первый шаг
            # 2) Второй шаг
            # 2020.01.01 не дата шага
            \`\`\`
        `;

        const {units, skeleton} = run(markdown);

        expect(units).toEqual([
            '<worker> - адрес воркера, например "[IPv6]:port"',
            'Первый шаг',
            'Второй шаг',
            '2020.01.01 не дата шага',
        ]);
        expect(skeleton).toContain('# 1. %%%1%%%');
        expect(skeleton).toContain('# 2) %%%2%%%');
    });

    it('does not take comparisons and generics for placeholders', () => {
        const markdown = dedent`
            \`\`\`python
            if a < b and c > d:  # сравнение
                pass
            \`\`\`

            \`\`\`java
            List<String> names = load(<путь к файлу>); // список <имён>
            Map<K, V> map = build(<your token>, <T>, <a:Int32>);
            \`\`\`

            \`\`\`yql
            SELECT AGGREGATE_BY(x, <вид_функции>) FROM t; -- Struct<a:Int32>
            \`\`\`

            \`\`\`text
            <host>:<port>, <1>, <= <>
            \`\`\`
        `;

        const {units} = run(markdown);

        expect(units).toEqual([
            'сравнение',
            'путь к файлу',
            'список <имён>',
            'your token',
            'вид_функции',
            'host',
            'port',
        ]);
    });

    it('does not take markers inside string literals for comments', () => {
        const markdown = dedent`
            \`\`\`ts
            const value = "prefix // human words"; // комментарий
            const url = \`https://x // y\`;
            const escaped = "a \\" // b" + 'c'; // после экранирования
            \`\`\`

            \`\`\`yaml
            value: "prefix # human words" # комментарий
            title: it's fine # апостроф не кавычка
            note: 'unterminated # не комментарий
            \`\`\`

            \`\`\`sql
            select 'prefix -- human words' -- комментарий
            \`\`\`

            \`\`\`bash
            echo "$(date) # not a comment" # комментарий
            \`\`\`
        `;

        expect(run(markdown).units).toEqual([
            'комментарий',
            'после экранирования',
            'комментарий',
            'апостроф не кавычка',
            'комментарий',
            'комментарий',
        ]);
    });

    it('keeps string literals that span lines and escaped quotes out of comments', () => {
        const markdown = dedent`
            \`\`\`ts
            const value = 'prefix \\' // human words'; // экранированная кавычка
            const text = \`
            prefix // human words
            \`; // после литерала
            \`\`\`

            \`\`\`python
            text = \"\"\"
            prefix # human words
            \"\"\"  # после докстринга
            \`\`\`

            \`\`\`yaml
            value: |
              prefix # human words

              # тоже внутри
            next: 1 # комментарий
            list:
              - >-
                prefix # human words
              - item # элемент
            key: | # индикатор с комментарием
              prefix # human words
            \`\`\`
        `;

        expect(run(markdown).units).toEqual([
            'экранированная кавычка',
            'после литерала',
            'после докстринга',
            'комментарий',
            'элемент',
            'индикатор с комментарием',
        ]);
    });

    it('is case-insensitive to the language name', () => {
        const markdown = dedent`
            \`\`\`YAML
            # Секция
            key: value
            \`\`\`
        `;

        expect(run(markdown).units).toEqual(['Секция']);
    });

    it('respects translate=no and translate=all', () => {
        const no = dedent`
            \`\`\`yaml translate=no
            # Секция
            key: value
            \`\`\`
        `;
        const all = dedent`
            \`\`\`yaml translate=all
            # Секция
            key: value
            \`\`\`
        `;

        expect(run(no).units).toEqual([]);
        expect(run(all).units.join('\n')).toContain('key: value');
    });
});

describe('code: prose heuristic for comments', () => {
    it.each([
        'Клиентская часть',
        'Серверная часть',
        'CA сертификат для проверки',
        'Настройки TLS для внутреннего транспорта',
        'TODO: вынести в конфиг',
        'Note: optional step',
        'Optional',
        'Шаг 1. Установка',
        'See https://example.com/docs for details',
        'set this to true in production',
        '1 час',
        'Или:',
        'Например:',
        '... parameterized balancing only',
    ])('treats "%s" as prose', (text) => {
        expect(isProse(text)).toBe(true);
    });

    it.each([
        '',
        '======',
        '!/bin/bash',
        'bus_client:',
        'encryption_mode: required',
        '  - name: value',
        'caBundle:',
        'file_name: /etc/yt/certs/client.pem',
        'export TOKEN=abc',
        'TOKEN=abc',
        'const retries = 3;',
        'return value',
        'import os',
        'print(config)',
        'console.log(value)',
        'SELECT * FROM users',
        'select * from users',
        '$ yt list //home',
        '/etc/yt/certs',
        'bus_client',
        'Struct<a:Int32>',
        '<worker>',
        '{{host}}',
        '@ts-ignore',
        'eslint-disable-next-line no-console',
        'noqa: E501',
        'type: ignore',
        '-*- coding: utf-8 -*-',
        '{ "key": "value" }',
        'sudo apt install yt',
        'git clone https://example.com/repo.git',
    ])('treats "%s" as code', (text) => {
        expect(isProse(text)).toBe(false);
    });
});
