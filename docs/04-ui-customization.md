# Кастомизация интерфейса и стили (UI Panels & Slots) 🎨

Плагины Config Studio могут бесшовно встраивать кастомные интерфейсы в приложение, поддерживая темную и светлую тему, акцентные цвета и дизайн-систему редактора **Core Design System v2**.

---

## 📐 Архитектура слотов расширения UI

Config Studio предоставляет **7 официальных слотов интеграции**:

```
+-----------------------------------------------------------------------------------+
| [Header] Logo   Tabs...   (Header Items)            [Поиск] [⚙️] [Секреты] [Профиль] |
+-----------------------------------------------------------------------------------+
| [Toolbar]  [ ▶ Run: build | ▾ ] (Action Toolbar)  |  Quick Jump: [Tag 1] [Tag 2] ...  |
+-------------+-------------------------------------+-------------------------------+
| File Tree   | Monaco Code Editor /                | (Split Panel)                 |
|             | Custom Tabs (openCustomTab)         |                               |
| [Right-     |                                     | Live Preview /                |
| Click       |                                     | Графические формы /           |
| Context     |                                     | Документация                  |
| Menu]       +-------------------------------------+                               |
|             | [ 🔍 Проблемы (N) ] [ 📋 Аудит ] [ 🐳 Док Плагинов... ] (Bottom Dock)|
+-------------+-------------------------------------+-------------------------------+
```

---

## 1. Панель действий: 1-Click Action Toolbar

Слот быстрого запуска задач над редактором. Реализует концепцию **Split Action Button**:
- Левая часть `[ ▶ Run: build ]` запускает действие по умолчанию в **1 клик** или по горячей клавише `F5`.
- Правая часть `[ ▾ ]` открывает выпадающее меню с переключением целей (`build`, `test`, `deploy`).

### Декларативная регистрация в `plugin.json`:
```json
"actionToolbar": {
  "primaryAction": "build",
  "targets": [
    { "id": "build", "label": "build (Default)" },
    { "id": "test", "label": "test" },
    { "id": "clean", "label": "clean" }
  ],
  "hotkey": "F5"
}
```

> 🎯 **Принцип Zero-Clutter:** Кнопки тулбара отображаются строго для файлов, указанных в `fileMatches` (например, `Makefile` или `docker-compose.yml`). Для остальных файлов тулбар автоматически скрывается, оставляя чистое пространство для работы с текстом.

---

## 2. Контекстное меню проводника файлов (Context Menu Provider)

Слот расширения контекстного меню по правому клику мыши на файлах, папках или пустой области проводника:

```javascript
window.ConfigStudio.registerContextMenu({
  id: 'git-blame',
  label: 'История изменений (Git Blame)',
  icon: 'git-commit', // Lucide icon
  group: 'tools', // 'open' | 'clipboard' | 'tools' | 'edit' | 'danger'
  order: 20,
  fileMatches: ['.yaml', '.json', '.conf'],
  targetType: 'file', // 'file' | 'folder' | 'empty' | 'any'
  onClick: async (target) => {
    const filePath = typeof target === 'string' ? target : target?.path;
    // Вызов команды или открытие панели...
  }
});
```

### Поддерживаемые группы пунктов:
- `open` — действия открытия и навигации.
- `clipboard` — операции буфера обмена (копирование пути, содержимого).
- `tools` — утилиты и действия плагинов (линтеры, деплой, превью).
- `edit` — модификация структуры файлов (переименование, форматирование).
- `danger` — удаление и опасные действия (выделяются красным цветом).

---

## 3. Пользовательские вкладки в редакторе (`openCustomTab`)

Позволяет плагину открывать виртуальные вкладки прямо в главном блоке вкладок редактора наряду с обычными файлами:

```javascript
await window.ConfigStudio.openCustomTab({
  path: 'virtual://servers/inventory-preview',
  name: 'Сводка серверов',
  language: 'yaml',
  readOnly: false,
  badge: 'FLEET',
  content: '# Сводка парка серверов\ntotal_nodes: 12\nactive: 12\n',
  onSave: async (content) => {
    console.log('Сохранено пользователем:', content);
  }
});
```

---

## 4. Сплит-панель (Split Screen Panel)

Монтируется справа от редактора кода. Идеально подходит для:
- Живого предпросмотра веб-страниц (HTML, PHP, Markdown, SVG).
- Интерактивных визуализаторов и графических форм.

```javascript
window.ConfigStudio.toggleSplitPanel({
  id: 'web-preview',
  pluginId: 'web-devkit',
  title: 'Предпросмотр страницы',
  open: true,
  render: (container) => {
    container.innerHTML = '<iframe src="http://localhost:8085" class="w-full h-full border-none"></iframe>';
  }
});
```

---

## 5. Постоянная нижняя полоса (Bottom Dock Strip)

Нижняя панель под Monaco Editor с поддержкой вкладок, плавного drag-ресайза высоты мышью и кнопки разворачивания во весь экран:

```javascript
window.ConfigStudio.toggleBottomPanel({
  id: 'server-logs',
  pluginId: 'my-plugin',
  title: 'Логи контейнеров',
  open: true,
  render: (container) => {
    container.innerHTML = `
      <div class="h-full bg-black/60 font-mono text-xs p-3 overflow-y-auto text-emerald-400">
        <div>[INFO] Application started on :8080</div>
      </div>
    `;
  }
});
```

---

## 6. Элемент шапки (Header Item)

Компактные виджеты в верхней навигационной строке:
```javascript
window.ConfigStudio.registerHeaderItem({
  id: 'fleet-status',
  pluginId: 'servers',
  order: 5,
  render: (container) => {
    container.innerHTML = `
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Fleet: 12 Nodes
      </div>
    `;
  }
});
```

---

## 7. Панель настроек плагина (Plugin Settings & Preferences)

Плагины могут предоставлять настройки для пользователей во вкладке настроек редактора **«Настройки плагинов»**.

### Вариант А: Декларативная схема в `plugin.json` (Автоматическая генерация формы)
```json
{
  "settings": [
    {
      "id": "autoReload",
      "label": "Автоматическая перезагрузка",
      "description": "Мягкий reload сервиса при сохранении файла",
      "type": "boolean",
      "default": true
    },
    {
      "id": "port",
      "label": "Порт локального сервера",
      "type": "number",
      "default": 8085
    },
    {
      "id": "themeMode",
      "label": "Стиль отчёта",
      "type": "select",
      "default": "compact",
      "options": [
        { "label": "Компактный", "value": "compact" },
        { "label": "Детальный", "value": "detailed" }
      ]
    }
  ]
}
```

### Вариант Б: Кастомный UI рендерер через JS API
```javascript
window.ConfigStudio.registerPluginSettings('my-plugin', {
  render: (container) => {
    container.innerHTML = `
      <div class="space-y-4">
        <h4 class="text-sm font-semibold">Кастомные параметры</h4>
        <button id="btn-sync" class="px-3 py-1.5 rounded-xl bg-accent text-white">Синхронизировать</button>
      </div>
    `;
  }
});
```

---

## 8. Дизайн-система `@config-studio/ui` и канонические модальные окна

Интерфейс редактора и официальных плагинов стандартизирован на базе единой дизайн-системы **`@config-studio/ui`**.

### Эталонные размеры модальных окон
Модальные окна плагинов должны следовать стандартной сетке размеров вместо случайных значений:

| Класс | Ширина | Назначение |
|---|---|---|
| `cs-modal-sm` / `.modal-sm` | `24vw (≥480px)` | Простые диалоги подтверждения, короткие вопросы, PIN-код |
| `cs-modal-md` / `.modal-md` | `32vw (≥540px)` | Компактные формы (2–4 поля), подключение серверов, токены |
| `cs-modal-lg` / `.modal-lg` | `45vw (≥500×400px)` | Вкладочные формы, детальные настройки узла, инвентарь |
| `cs-modal-xl` / `.modal-xl` | `60vw (≥620×480px)` | Сложные многоколоночные формы, детальные таблицы, Diff-сравнение |
| `cs-modal-xxl` / `.modal-xxl`| `80vw (≥780×580px)` | Настройки приложения и полнофункциональные менеджеры |
| `cs-modal-fullscreen` / `.modal-fullscreen` | `100vw / 100vh` | Полноэкранные терминалы, редакторы и дашборды |
| `cs-modal-fixed` | `h-[82vh] min-h-[580px] max-h-[820px]` | **Zero-Jitter фиксация высоты** для окон со вкладками |

### Кастомные Dropdown (Селекторы серверов, ключей и режимов)
Дефолтные браузерные `<select>` заменяются на фирменные Dropdown-компоненты через `window.ConfigStudio.ui.renderDropdown(container, config)`:
- **Умный авто-разворот (`openUpward`)**: если до нижнего края окна браузера менее `220px`, выпадающее меню автоматически разворачивается вверх.
- **Индикаторы и бейджи**: круглые точки статуса подключения (онлайн/офлайн) и бейджи типов (`PASSWORD`, `TOKEN`, `SSH`).
- **Поиск (Searchable)**: встроенная фильтрация опций на лету.

```javascript
const container = document.getElementById('my-dropdown-root');
const dropdown = window.ConfigStudio.ui.renderDropdown(container, {
  options: [
    { value: 'srv-1', label: 'srv-1 (Debian 12)', statusDot: 'online', badge: 'PROD', badgeVariant: 'success' },
    { value: 'srv-2', label: 'srv-2 (Alpine 3.20)', statusDot: 'offline', badge: 'DEV', badgeVariant: 'warning' }
  ],
  value: 'srv-1',
  searchable: true,
  placeholder: 'Выберите сервер...',
  onChange: (value, option) => {
    console.log('Выбран сервер:', value);
  }
});
```

---

## 🎨 Переменные CSS и Tailwind CSS (Core Design System v2)

Приложение полностью совместимо со стандартными классами **Tailwind CSS**. Дополнительно доступны глобальные CSS-переменные:

```css
var(--bg-base)            /* Основной фон окна (#0d1117 / #ffffff) */
var(--bg-base-surface)    /* Фон карточек и модальных окон */
var(--border-base)        /* Цвет разделителей и границ */
var(--accent-color)       /* Акцентный цвет кнопок (выбирается в настройках) */
var(--text-primary)       /* Основной текст */
var(--text-secondary)     /* Второстепенный текст и подсказки */
```
