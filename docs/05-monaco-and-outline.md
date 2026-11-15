# Интеграция с Monaco Editor и Парсеры AST-структуры 🧠

Config Studio использует ядро **Monaco Editor** (движок VS Code) и предоставляет плагинам API для регистрации провайдеров автодополнения (IntelliSense), сниппетов, а также построения интерактивной карты документа (**AST Map**) и облака быстрых переходов (**Quick Jump**).

---

## 1. Регистрация автодополнения (IntelliSense)

Через метод `window.ConfigStudio.registerCompletionProvider(language, provider)` вы можете снабжать редактор подсказками для любого языка.

### Пример: Добавление сниппетов для Nginx конфигов

```javascript
(function() {
  const monaco = window.ConfigStudio.getMonaco();
  if (!monaco) return;

  const kind = monaco.languages.CompletionItemKind.Snippet;

  window.ConfigStudio.registerCompletionProvider('nginx', {
    triggerCharacters: ['s', 'l', 'u'],
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: 'server',
          kind: kind,
          insertText: [
            'server {',
            '    listen 80;',
            '    server_name ${1:example.com};',
            '',
            '    location / {',
            '        proxy_pass http://${2:127.0.0.1:8080};',
            '        proxy_set_header Host \\$host;',
            '    }',
            '}'
          ].join('\n'),
          insertTextRules: 4, // Snippet format (Tab-stops: $1, $2)
          documentation: 'Базовый блок виртуального хоста Nginx Reverse Proxy'
        },
        {
          label: 'upstream',
          kind: kind,
          insertText: [
            'upstream ${1:backend} {',
            '    server 127.0.0.1:3000;',
            '    server 127.0.0.1:3001;',
            '}'
          ].join('\n'),
          insertTextRules: 4,
          documentation: 'Балансировщик upstream'
        }
      ];

      return { suggestions: suggestions };
    }
  });
})();
```

---

## 2. Разработка собственного Outline-провайдера (AST Map)

Config Studio автоматически строит дерево структуры для YAML, JSON, TOML, INI, HTML и PHP.
С помощью `registerOutlineProvider` плагин может зарегистрировать парсер структуры для **любого другого формата** (SQL, Dockerfile, Nginx, Rust, Go, Python, Caddy, HAProxy и др.).

### Формат объекта узла `OutlineNode`:
```typescript
interface OutlineNode {
  id?: string;       // Уникальный ID узла (если опущен, ядро сгенерирует автоматически)
  label?: string;    // Название узла (отображается в дереве и на теге Quick Jump)
  name?: string;     // Алиас для label
  type?: string;     // 'section' | 'function' | 'class' | 'object' | 'list' | 'string' | 'number' | 'boolean'
  kind?: string;     // Алиас для type
  line?: number;     // 1-based номер строки для перехода (по умолчанию 1)
  column?: number;   // 1-based номер колонки (опционально)
  value?: string;    // Краткое превью значения
  children?: OutlineNode[]; // Дочерние узлы вложенной структуры
}
```

### Алгоритм автоматической нормализации ядра Config Studio:
Ядро Config Studio обеспечивает максимальную устойчивость (Fail-Safe) при парсинге:
1. **Гибкие имена полей:** если ваш парсер возвращает `name` вместо `label` или `kind` вместо `type`, нормализатор автоматически приводит их к единому стандарту.
2. **Безопасная обработка ошибок:** если внутри пользовательской функции `parse()` произойдет исключение (Exception), ядро перехватит его, залогирует в консоль и вернет пустой список без падения редактора.
3. **Автоматический алиасинг расширений:** регистрация провайдера для `yaml` автоматически связывается с `yml` и наоборот.

---

### Пример: Провайдер структуры для Nginx/Apache конфигов

```javascript
window.ConfigStudio.registerOutlineProvider({
  language: 'nginx', // Язык Monaco или расширение файла (например: 'conf')
  parse: (content, filename) => {
    const nodes = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Ищем блоки server {
      if (trimmed.startsWith('server {') || trimmed === 'server{') {
        nodes.push({
          id: `server-${lineNum}`,
          label: 'server',
          type: 'section',
          line: lineNum
        });
      }

      // Ищем location /path {
      const locMatch = trimmed.match(/^location\s+([^{]+)\s*\{/);
      if (locMatch) {
        nodes.push({
          id: `loc-${lineNum}`,
          label: `location ${locMatch[1].trim()}`,
          type: 'function',
          line: lineNum
        });
      }

      // Ищем upstream name {
      const upMatch = trimmed.match(/^upstream\s+([^{]+)\s*\{/);
      if (upMatch) {
        nodes.push({
          id: `up-${lineNum}`,
          label: `upstream ${upMatch[1].trim()}`,
          type: 'object',
          line: lineNum
        });
      }
    });

    return nodes;
  }
});
```

### Что происходит автоматически:
1. В правой панели **«Структура (AST Map)»** появится интерактивное иерархическое дерево узлов с поиском и счетчиком строк.
2. В строке под вкладками редактора появятся **интерактивные кнопки быстрого перехода (Quick Jump)**. При клике на тег редактор плавно прокручивает документ точно к этой строке!
