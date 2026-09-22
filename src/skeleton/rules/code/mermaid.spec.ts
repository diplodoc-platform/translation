import {describe, expect, it} from 'vitest';
import {dedent} from 'ts-dedent';

import {compose, extract} from 'src/api';
import {CodeProcessing} from 'src/consumer';

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

describe('code: mermaid sequence diagrams', () => {
    const markdown = dedent`
        \`\`\`mermaid
        %%{init: {'theme':'base', 'themeVariables': { 'fontSize': '11px' }, 'sequence': { 'autonumber': false } }}%%
        sequenceDiagram
            participant RPC as RPC
            participant C as Клиент<br/>(bus_client)
            participant Bus

            Note over RPC: Создает protobuf сообщение
            rect rgb(255, 243, 224)
            RPC->>Bus: Передает сообщение как набор байт
            end
            Bus-->>+RPC: Ответ
            Note over C,Bus: Обмен Handshake
            C-xBus: SslAck
            loop Каждую секунду
                Bus->>Bus: Дожидается полного сообщения<br/>по известному размеру
            end
            alt Успех
                Bus->>RPC: Готово
            else
                Bus->>RPC: Ошибка
            end
            activate RPC
            deactivate RPC
        \`\`\`
    `;

    it('extracts notes, messages, aliases and block labels', () => {
        const {units, skeleton, xliff} = run(markdown);

        expect(units).toEqual([
            'RPC',
            'Клиент<br/>(bus_client)',
            'Создает protobuf сообщение',
            'Передает сообщение как набор байт',
            'Ответ',
            'Обмен Handshake',
            'SslAck',
            'Каждую секунду',
            'Дожидается полного сообщения<br/>по известному размеру',
            'Успех',
            'Готово',
            'Ошибка',
        ]);

        expect(skeleton).toBe(dedent`
            \`\`\`mermaid
            %%{init: {'theme':'base', 'themeVariables': { 'fontSize': '11px' }, 'sequence': { 'autonumber': false } }}%%
            sequenceDiagram
                participant RPC as %%%0%%%
                participant C as %%%1%%%
                participant Bus

                Note over RPC: %%%2%%%
                rect rgb(255, 243, 224)
                RPC->>Bus: %%%3%%%
                end
                Bus-->>+RPC: %%%4%%%
                Note over C,Bus: %%%5%%%
                C-xBus: %%%6%%%
                loop %%%7%%%
                    Bus->>Bus: %%%8%%%
                end
                alt %%%9%%%
                    Bus->>RPC: %%%10%%%
                else
                    Bus->>RPC: %%%11%%%
                end
                activate RPC
                deactivate RPC
            \`\`\`
        `);

        expect(compose(skeleton, xliff, {useSource: true})).toBe(markdown);
    });

    it('composes translated labels back into the diagram', () => {
        const {skeleton, xliff} = run(markdown);

        const translated = translate(xliff, {
            RPC: 'RPC',
            'Клиент<br/>(bus_client)': 'Client<br/>(bus_client)',
            'Создает protobuf сообщение': 'Creates a protobuf message',
            'Передает сообщение как набор байт': 'Passes the message as bytes',
            Ответ: 'Response',
            'Обмен Handshake': 'Handshake exchange',
            SslAck: 'SslAck',
            'Каждую секунду': 'Every second',
            'Дожидается полного сообщения<br/>по известному размеру':
                'Waits for the whole message<br/>by its known size',
            Успех: 'Success',
            Готово: 'Done',
            Ошибка: 'Error',
        });

        expect(compose(skeleton, translated, {useSource: false})).toBe(dedent`
            \`\`\`mermaid
            %%{init: {'theme':'base', 'themeVariables': { 'fontSize': '11px' }, 'sequence': { 'autonumber': false } }}%%
            sequenceDiagram
                participant RPC as RPC
                participant C as Client<br/>(bus_client)
                participant Bus

                Note over RPC: Creates a protobuf message
                rect rgb(255, 243, 224)
                RPC->>Bus: Passes the message as bytes
                end
                Bus-->>+RPC: Response
                Note over C,Bus: Handshake exchange
                C-xBus: SslAck
                loop Every second
                    Bus->>Bus: Waits for the whole message<br/>by its known size
                end
                alt Success
                    Bus->>RPC: Done
                else
                    Bus->>RPC: Error
                end
                activate RPC
                deactivate RPC
            \`\`\`
        `);
    });

    it('extracts the title and left/right notes', () => {
        const {units, skeleton} = run(dedent`
            \`\`\`mermaid
            sequenceDiagram
                title Схема обмена
                Note left of A: Слева
                note right of B: Справа
                box rgb(200, 200, 200) Группа
                participant A
                end
            \`\`\`
        `);

        expect(units).toEqual(['Схема обмена', 'Слева', 'Справа', 'Группа']);
        expect(skeleton).toContain('title %%%0%%%');
        expect(skeleton).toContain('Note left of A: %%%1%%%');
        expect(skeleton).toContain('note right of B: %%%2%%%');
        expect(skeleton).toContain('box rgb(200, 200, 200) %%%3%%%');
    });
});

describe('code: mermaid flowcharts', () => {
    const markdown = dedent`
        \`\`\`mermaid
        ---
        title: Поток данных
        ---
        flowchart LR
            %% комментарий схемы
            A[Клиент] -->|Запрос| B(Сервер)
            B --> C{Есть кэш?}
            C -- Да --> D[[Кэш]]
            C -. Нет .-> E[("База данных")]
            E ==> F((Ответ))
            F --> G>Готово]
            subgraph net [Сеть]
                A
            end
            H[1] --> I[ ]
            classDef default fill:#fff
            style A fill:#f9f
            click A "https://example.com" "Открыть"
        \`\`\`
    `;

    it('extracts node and edge labels and keeps identifiers', () => {
        const {units, skeleton, xliff} = run(markdown);

        expect(units).toEqual([
            'Поток данных',
            'Клиент',
            'Запрос',
            'Сервер',
            'Есть кэш?',
            'Да',
            'Кэш',
            'Нет',
            'База данных',
            'Ответ',
            'Готово',
            'Сеть',
        ]);

        expect(skeleton).toBe(dedent`
            \`\`\`mermaid
            ---
            title: %%%0%%%
            ---
            flowchart LR
                %% комментарий схемы
                A[%%%1%%%] -->|%%%2%%%| B(%%%3%%%)
                B --> C{%%%4%%%}
                C -- %%%5%%% --> D[[%%%6%%%]]
                C -. %%%7%%% .-> E[("%%%8%%%")]
                E ==> F((%%%9%%%))
                F --> G>%%%10%%%]
                subgraph net [%%%11%%%]
                    A
                end
                H[1] --> I[ ]
                classDef default fill:#fff
                style A fill:#f9f
                click A "https://example.com" "Открыть"
            \`\`\`
        `);

        expect(compose(skeleton, xliff, {useSource: true})).toBe(markdown);
    });

    it('supports graph diagrams and labels with html breaks', () => {
        const {units, skeleton} = run(dedent`
            \`\`\`mermaid
            graph TD
                start[Начало<br/>работы] --> stop{{Конец}}
                start ---|Связь| stop
                start <-->|"Протокол<br>(сокет)"| stop
            \`\`\`
        `);

        expect(units).toEqual(['Начало<br/>работы', 'Конец', 'Связь', 'Протокол<br>(сокет)']);
        expect(skeleton).toContain('start[%%%0%%%] --> stop{{%%%1%%%}}');
        expect(skeleton).toContain('start ---|%%%2%%%| stop');
        expect(skeleton).toContain('start <-->|"%%%3%%%"| stop');
    });
});

describe('code: mermaid corner cases', () => {
    it('does not take circle and cross arrow heads for edge labels', () => {
        const {units, skeleton} = run(dedent`
            \`\`\`mermaid
            flowchart LR
                A --o B --> C[Узел]
                A --x B
                A --oxygen level--> B
            \`\`\`
        `);

        expect(units).toEqual(['Узел', 'oxygen level']);
        expect(skeleton).toContain('A --o B --> C[%%%0%%%]');
        expect(skeleton).toContain('A --%%%1%%%--> B');
    });

    it('extracts every documented node shape', () => {
        const {units, skeleton} = run(dedent`
            \`\`\`mermaid
            flowchart TD
                A([Стадион]) --> B[(Цилиндр)] --> C((Круг)) --> D>Флаг]
                E{Ромб} --> F{{Шестиугольник}} --> G[/Параллелограмм/] --> H[\\Обратный\\]
                I[/Трапеция\\] --> J[\\Трапеция два/] --> K(((Двойной круг))) --> L[[Подпрограмма]]
                M@{ shape: rounded, label: "Новая форма" } --> N@{ label: 'Одинарные', shape: rect }
            \`\`\`
        `);

        expect(units).toEqual([
            'Стадион',
            'Цилиндр',
            'Круг',
            'Флаг',
            'Ромб',
            'Шестиугольник',
            'Параллелограмм',
            'Обратный',
            'Трапеция',
            'Трапеция два',
            'Двойной круг',
            'Подпрограмма',
            'Новая форма',
            'Одинарные',
        ]);
        expect(skeleton).toContain('A([%%%0%%%]) --> B[(%%%1%%%)] --> C((%%%2%%%)) --> D>%%%3%%%]');
        expect(skeleton).toContain(
            'M@{ shape: rounded, label: "%%%12%%%" } --> N@{ label: \'%%%13%%%\', shape: rect }',
        );
    });

    it('handles unicode node identifiers', () => {
        const {units, skeleton} = run(dedent`
            \`\`\`mermaid
            graph LR
                Клиент[Клиент] --> Сервер(Ответ)
            \`\`\`
        `);

        expect(units).toEqual(['Клиент', 'Ответ']);
        expect(skeleton).toContain('Клиент[%%%0%%%] --> Сервер(%%%1%%%)');
    });

    it('strips quotes of a quoted title', () => {
        const {units, skeleton} = run(dedent`
            \`\`\`mermaid
            xychart-beta
                title "Продажи"
                x-axis [jan, feb]
            \`\`\`
        `);

        expect(units).toEqual(['Продажи']);
        expect(skeleton).toContain('title "%%%0%%%"');
    });

    it('skips init directives that span several lines', () => {
        const {units} = run(dedent`
            \`\`\`mermaid
            %%{init: {
                'theme': 'base',
                'themeVariables': { 'primaryColor': '#fff' }
            }}%%
            sequenceDiagram
                A->>B: Привет
            \`\`\`
        `);

        expect(units).toEqual(['Привет']);
    });
});

describe('code: other mermaid diagrams', () => {
    it('extracts only the title from unsupported diagram types', () => {
        const {units, skeleton} = run(dedent`
            \`\`\`mermaid
            pie
                title Доли
                "Собаки" : 386
            \`\`\`

            \`\`\`mermaid
            gantt
                title План
                section Раздел
                Задача :a1, 2014-01-01, 30d
            \`\`\`
        `);

        expect(units).toEqual(['Доли', 'План']);
        expect(skeleton).toContain('"Собаки" : 386');
        expect(skeleton).toContain('section Раздел');
    });

    it('does nothing for mermaid blocks with translate=no', () => {
        const {units} = run(dedent`
            \`\`\`mermaid translate=no
            sequenceDiagram
                A->>B: Привет
            \`\`\`
        `);

        expect(units).toEqual([]);
    });
});
