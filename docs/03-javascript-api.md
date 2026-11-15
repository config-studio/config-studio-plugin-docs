# Справочник JavaScript API (`window.ConfigStudio`) 🛠️

Каждый плагин получает доступ к глобальному объекту `window.ConfigStudio`. Это мощный фасад, предоставляющий методы для управления интерфейсом, Monaco Editor, вкладками редактора, нативным SSH/SFTP, терминалом, фоновыми процессами, межплагинными сервисами, хранилищем секретов, мониторингом системы и локализацией.

---

## 📑 Содержание

1. [Точки расширения UI (Панели, Тулбар, Меню, Шапка)](#1-точки-расширения-ui)
2. [Пользовательские вкладки в редакторе (`openCustomTab`)](#2-пользовательские-вкладки-в-редакторе-opencustomtab)
3. [Нативный SSH и SFTP менеджер хостов](#3-нативный-ssh-и-sftp-менеджер-хостов)
4. [Контекстное меню проводника файлов](#4-контекстное-меню-проводника-файлов)
5. [Шина межплагинных сервисов (RPC / Proxy Bridge)](#5-шина-межплагинных-сервисов-rpc--proxy-bridge)
6. [Безопасное хранилище секретов (OS Keychain / Vault)](#6-безопасное-хранилище-секретов-os-keychain--vault)
7. [Аппаратный мониторинг и телеметрия серверов (`sysinfo`)](#7-аппаратный-мониторинг-и-телеметрия-серверов-sysinfo)
8. [Компоненты UI и Дизайн-система (`ui.renderDropdown`, `ui.toast`)](#8-компоненты-ui-и-дизайн-система)
9. [Встроенная мультиязычность и переводы (`i18n`)](#9-встроенная-мультиязычность-и-переводы-i18n)
10. [Работа с открытыми файлами и редактором](#10-работа-с-открытыми-файлами-и-редактором)
11. [Интеграция с Monaco Editor и AST-картой](#11-интеграция-с-monaco-editor-и-ast-картой)
12. [Выполнение системных команд на хосте](#12-выполнение-системных-команд-на-хосте)
13. [Параметры и настройки плагина (`registerPluginSettings`)](#13-параметры-и-настройки-плагина)
14. [Аудит, логирование и телеметрия ошибок](#14-аудит-логирование-и-телеметрия-ошибок)

---

## 1. Точки расширения UI

### `registerToolbarButton(buttonDef)`
Регистрирует кнопку в верхней панели инструментов над редактором:

```javascript
window.ConfigStudio.registerToolbarButton({
  id: 'my-build-btn',
  pluginId: 'my-plugin',
  label: 'Собрать',
  title: 'Запустить сборку проекта (F5)',
  icon: 'play', // Lucide icon
  shortcut: 'F5',
  fileMatches: ['Makefile', 'docker-compose*.yml'], // Если не указано, наследуется из манифеста
  visible: (file) => !!file,
  onClick: async () => {
    window.ConfigStudio.showNotification('Сборка запущена...', 'info');
  }
});
```

### `toggleSplitPanel(panelDef)`
Открывает или закрывает правую сплит-панель (Split Screen) рядом с Monaco Editor (для Live Preview, графических форм, документации):

```javascript
window.ConfigStudio.toggleSplitPanel({
  id: 'my-preview',
  pluginId: 'my-plugin',
  title: 'Живой предпросмотр',
  open: true,
  render: (container) => {
    container.innerHTML = '<div class="p-4 text-xs text-teal-300">Превью активно!</div>';
  }
});
```

### `toggleBottomPanel(panelDef)`
Открывает или закрывает нижнюю панель (Bottom Dock) под Monaco Editor (для логов, терминалов, результатов сборки):

```javascript
window.ConfigStudio.toggleBottomPanel({
  id: 'build-logs',
  pluginId: 'my-plugin',
  title: 'Логи сборки',
  open: true,
  render: (container) => {
    container.innerHTML = '<div class="p-3 bg-black/60 font-mono text-xs text-emerald-400">Готово!</div>';
  }
});
```

### `registerHeaderItem(itemDef)`
Встраивает компактный бейдж, кнопку или селектор прямо в верхнюю навигационную строку (Header):

```javascript
window.ConfigStudio.registerHeaderItem({
  id: 'env-indicator',
  pluginId: 'my-plugin',
  order: 10,
  render: (container) => {
    container.innerHTML = `
      <span class="px-2 py-0.5 text-xs rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
        STAGING
      </span>
    `;
  }
});
```

---

## 2. Пользовательские вкладки в редакторе (`openCustomTab`)

*(Доступно в v2.2.0+)*

Метод `openCustomTab(tab)` позволяет плагину открыть полноценную вкладку прямо в главной области вкладок редактора. Это незаменимо для отображения Diff-сравнений, дашбордов, удаленных файлов по SFTP или виртуальных документов:

```javascript
await window.ConfigStudio.openCustomTab({
  path: 'virtual://servers/cluster-status',
  name: 'Статус кластера',
  language: 'yaml', // Monaco language для подсветки синтаксиса
  readOnly: false,
  badge: 'REMOTE',
  content: 'cluster:\n  nodes: 5\n  status: healthy\n',
  onSave: async (newContent) => {
    console.log('Пользователь нажал Ctrl+S на кастомной вкладке:', newContent);
    window.ConfigStudio.showNotification('Изменения сохранены!', 'success');
  }
});
```

---

## 3. Нативный SSH и SFTP менеджер хостов

Config Studio включает встроенный SSH-клиент, эмулятор терминала (xterm.js) и двухпанельный SFTP-менеджер файлов. Плагины могут напрямую взаимодействовать с ними:

### Открытие терминала и SFTP:
```javascript
// Открыть вкладку SSH-терминала для сервера
window.ConfigStudio.openTerminal({
  id: 'srv-prod',
  name: 'Production Node',
  host: '192.168.1.100',
  port: 22,
  user: 'root'
});

// Открыть SFTP-браузер файлов для сервера
window.ConfigStudio.openSftp({
  id: 'srv-prod',
  name: 'Production Node',
  host: '192.168.1.100',
  port: 22,
  user: 'root'
});
```

### Сервис хостов `window.ConfigStudio.ssh`:
Предоставляет полный доступ к базе сохраненных серверов:
- `ssh.list()` — получить массив всех сконфигурированных SSH-узлов.
- `ssh.get(id)` — получить данные сервера по ID.
- `ssh.save(host)` — сохранить новый или отредактированный узел в Core Host Storage.
- `ssh.delete(id)` — удалить сервер из инвентаря.
- `ssh.subscribe(listener)` — реактивная подписка на изменения списка серверов.
- `ssh.getLastActiveHostId()` / `ssh.setLastActiveHostId(id)` — получить/установить последний активный хост.
- `ssh.exportOpenSSH()` — экспорт базы хостов в формат `~/.ssh/config`.

```javascript
// Пример получения списка хостов
const hosts = window.ConfigStudio.ssh.list();
hosts.forEach(h => console.log(`Узел: ${h.name} (${h.host}:${h.port})`));
```

---

## 4. Контекстное меню проводника файлов

> ⚠️ Требует разрешения `"contextmenu"` в манифесте.

Позволяет плагину добавлять собственные пункты в меню по правому клику мыши на файлы, папки или пустую область дерева файлов:

```javascript
window.ConfigStudio.registerContextMenu({
  id: 'duplicate-config',
  label: 'Создать резервную копию (.bak)',
  icon: 'copy', // Lucide icon name
  group: 'tools', // 'open' | 'clipboard' | 'tools' | 'edit' | 'danger'
  order: 10,
  shortcut: 'Ctrl+Shift+B',
  fileMatches: ['.yaml', '.yml', '.conf', '.env'],
  targetType: 'file', // 'file' | 'folder' | 'empty' | 'any'
  onClick: async (target) => {
    const targetPath = typeof target === 'string' ? target : target?.path;
    if (!targetPath) return;
    try {
      const content = window.ConfigStudio.getActiveContent();
      await window.ConfigStudio.createFile(`${targetPath}.bak`, content);
      window.ConfigStudio.showNotification(`Резервная копия создана: ${targetPath}.bak`, 'success');
      await window.ConfigStudio.refreshFiles();
    } catch (e) {
      window.ConfigStudio.showNotification(`Ошибка: ${e.message}`, 'error');
    }
  },
  isVisible: (target) => !!(typeof target === 'string' ? target : target?.path),
  isEnabled: () => true
});
```

---

## 5. Шина межплагинных сервисов (RPC / Proxy Bridge)

Config Studio включает высокопроизводительную и безопасную шину для прямого взаимодействия между плагинами.

### Для провайдера: `services.register(name, implementation, providerId)`
Объявите имя сервиса в `providesServices` в `plugin.json` и зарегистрируйте его API:

```javascript
// Плагин "ssh-client"
window.ConfigStudio.services.register('ssh', {
  exec: async (host, cmd) => {
    return { exitCode: 0, stdout: 'ok' };
  },
  upload: async (host, localPath, remotePath) => {
    return true;
  }
}, 'ssh-client');
```

### Для потребителя (Обязательный сервис): `services.get(name, consumerId)`
Объявите зависимость в `dependencies` и разрешение `service:<name>` в `plugin.json`:

```javascript
// Плагин "quick-deploy"
const ssh = await window.ConfigStudio.services.get('ssh', 'quick-deploy');
const result = await ssh.exec('192.168.1.10', 'docker compose pull');
window.ConfigStudio.showNotification('Команда выполнена!', 'success');
```
*Примечание: Если сервис не зарегистрирован или плагин-провайдер отключен, `services.get` выбрасывает исключение.*

### Для потребителя (Опциональный сервис): `services.getOptional(name, consumerId)` *(v2.0.0+)*
Используется для мягких зависимостей (`optionalDependencies`), когда плагин может продолжать работать даже без стороннего модуля:

```javascript
const formatter = await window.ConfigStudio.services.getOptional('yaml-formatter', 'quick-deploy');

if (formatter) {
  const formatted = await formatter.format(activeContent);
  window.ConfigStudio.setActiveContent(formatted);
} else {
  console.log('[quick-deploy] YAML Formatter не установлен, используется базовый режим');
}
```
*Метод **никогда не выбрасывает ошибку** — если плагин не установлен или отключен, он возвращает `null`.*

---

## 6. Безопасное хранилище секретов (OS Keychain / Vault)

> ⚠️ Требует разрешения `"secrets"` или `"secrets.access"` в манифесте.

Позволяет плагинам безопасно сохранять и считывать токены, пароли, приватные SSH-ключи и учетные данные агентов, хранящиеся в системном Keychain ОС или зашифрованном AES-256-GCM Vault.

### Методы `window.ConfigStudio.secrets`:
- `secrets.get(id, scope?)` — получить значение секрета по ID.
- `secrets.set({ id, label, category, value })` — сохранить или обновить секрет.
- `secrets.delete(id)` — удалить секрет по ID.
- `secrets.list(category?)` — получить список метаданных секретов (без значений).
- `secrets.listShared()` — список названий общих секретов флота.
- `secrets.getStatus()` — статус хранилища (`backend`, `isAvailable`, `count`, `authEnabled`, `privilegedActive`).
- `secrets.unlock(password)` — разблокировать хранилище мастер-паролем.

### Категории секретов:
- `agent_credentials` — учетные данные удаленных демонов (`config-studio-agent`).
- `ssh_key` — приватные ключи OpenSSH.
- `token` — токены доступа API (GitHub, GitLab, Docker Hub).
- `password` — пароли баз данных и узлов.
- `shared` — общие строковые секреты флота.

```javascript
// Пример сохранения и чтения секрета
await window.ConfigStudio.secrets.set({
  id: 'agent:node-01',
  label: 'Node 01 Agent Secret',
  category: 'agent_credentials',
  value: 'SUPER_SECRET_TOKEN_123'
});

const token = await window.ConfigStudio.secrets.get('agent:node-01');
```

---

## 7. Аппаратный мониторинг и телеметрия серверов (`sysinfo`)

*(Доступно в v2.1.0+)*

Предоставляет плагинам аппаратные метрики CPU, RAM, дисков и аптайма как для локальной машины, так и для удаленных узлов с установленным агентом:

```javascript
// 1. Получить текущее состояние телеметрии
const state = window.ConfigStudio.sysinfo.getState();
console.log('Активный узел:', state.activeNodeName);

// 2. Получить текущие метрики
const metrics = window.ConfigStudio.sysinfo.get();
if (metrics) {
  console.log(`CPU: ${metrics.cpu.usagePercent.toFixed(1)}% (${metrics.cpu.cores} cores)`);
  console.log(`RAM: ${window.ConfigStudio.sysinfo.formatBytes(metrics.memory.usedBytes)} / ${window.ConfigStudio.sysinfo.formatBytes(metrics.memory.totalBytes)}`);
  console.log(`Uptime: ${window.ConfigStudio.sysinfo.formatUptime(metrics.uptimeSeconds)}`);
}

// 3. Подписка на реактивное обновление метрик
const unsubscribe = window.ConfigStudio.sysinfo.subscribe((newState) => {
  if (newState.metrics) {
    updateHardwareWidget(newState.metrics);
  }
});

// 4. Переключение узла для мониторинга
window.ConfigStudio.sysinfo.setActiveNode('node-02', 'Debian Production');
```

---

## 8. Компоненты UI и Дизайн-система

### Фирменный Dropdown-компонент (`ui.renderDropdown`)
Вместо стандартного браузерного `<select>` плагины могут монтировать канонический выпадающий список дизайн-системы Config Studio с поддержкой поиска, статусов и бейджей:

```javascript
const container = document.getElementById('dropdown-mount');

const controller = window.ConfigStudio.ui.renderDropdown(container, {
  options: [
    { value: 'srv-1', label: 'srv-1 (Debian 12)', statusDot: 'online', badge: 'PROD', badgeVariant: 'success' },
    { value: 'srv-2', label: 'srv-2 (Ubuntu 24)', statusDot: 'offline', badge: 'DEV', badgeVariant: 'warning' }
  ],
  value: 'srv-1',
  searchable: true,
  searchPlaceholder: 'Поиск сервера...',
  placeholder: 'Выберите сервер',
  size: 'md',
  onChange: (selectedVal, option) => {
    console.log('Выбран сервер:', selectedVal, option);
  }
});

// Управление контроллером программно:
controller.setValue('srv-2');
console.log('Текущее значение:', controller.getValue());
// controller.destroy(); // При размонтировании
```

### Всплывающие тосты (`ui.toast`)
```javascript
window.ConfigStudio.ui.toast('Настройки успешно сохранены', 'success', 'Синхронизация');
```

---

## 9. Встроенная мультиязычность и переводы (`i18n`)

Плагины могут использовать встроенный движок локализации Config Studio для автоматического перевода интерфейса на язык пользователя:

```javascript
const pluginId = 'my-tool';

// Создаем скоуп-переводчик для своего плагина
const { t } = window.ConfigStudio.i18n.scoped(pluginId);

// Использование переводов с запасным вариантом (fallback)
const buttonLabel = t('run_deploy', 'Запустить деплой');
const statusText = t('deploy_success', 'Деплой на {count} серверов завершен!', { count: 5 });

// Получение текущего языка приложения ('ru', 'en', 'de' и т.д.)
const currentLang = window.ConfigStudio.i18n.getLanguage();

// Подписка на реактивную смену языка без перезагрузки
window.ConfigStudio.i18n.onLanguageChange((newLang) => {
  console.log('Язык интерфейса изменен на:', newLang);
  updateUI();
});
```

---

## 10. Работа с открытыми файлами и редактором

### `getActiveFile()`
Возвращает объект активного файла: `{ name, path, content, ext, isDirty }` или `null`.

### `getActiveContent()` / `setActiveContent(content)`
Чтение и синхронная замена содержимого активного редактора:
```javascript
const text = window.ConfigStudio.getActiveContent();
window.ConfigStudio.setActiveContent(text.trim());
```

### `createFile(path, content?)`
Создает файл на диске в рабочей директории проекта:
```javascript
await window.ConfigStudio.createFile('docker-compose.prod.yml', 'version: "3.8"...');
```

### `openFile(path, options?)`
Открывает файл по пути с возможностью перехода на конкретную строку:
```javascript
await window.ConfigStudio.openFile('configs/nginx.conf', { line: 42, highlight: true });
```

### `refreshFiles()`
Принудительно обновляет дерево проводника файлов на клиенте.

---

## 11. Интеграция с Monaco Editor и AST-картой

### `getMonaco()` / `getEditor()`
Возвращает оригинальные объекты `monaco` и инстанс Monaco Editor для тонкой настройки (курсоры, выделения, маркеры).

### `registerCompletionProvider(language, provider)`
Регистрирует подсказки IntelliSense и сниппеты для указанного языка.

### `registerOutlineProvider(provider)`
Регистрирует кастомный парсер структуры документа для построения AST-карты и Quick Jump тегов:

```javascript
window.ConfigStudio.registerOutlineProvider({
  language: 'nginx',
  parse: (content, filename) => {
    const nodes = [];
    content.split('\n').forEach((line, idx) => {
      const match = line.match(/^\s*(server|location)\s*(.*)\{/);
      if (match) {
        nodes.push({
          id: `block-${idx}`,
          label: `${match[1]} ${match[2]}`.trim(),
          type: 'section',
          line: idx + 1
        });
      }
    });
    return nodes;
  }
});
```
*Примечание: Встроенный нормализатор автоматически принимает как `label`, так и `name`; как `type`, так и `kind`.*

---

## 12. Выполнение системных команд на хосте

> ⚠️ Требует разрешения `"shell.exec"` или `"terminal.exec"`.

### `exec(request)`
Запуск системной команды на хосте с получением кода возврата и stdout/stderr:

```javascript
try {
  const result = await window.ConfigStudio.exec({
    pluginId: 'my-plugin',
    command: 'docker',
    args: ['compose', 'up', '-d'],
    cwd: './deploy'
  });

  if (result.exitCode === 0) {
    window.ConfigStudio.showNotification('Контейнеры запущены!', 'success');
  } else {
    window.ConfigStudio.showNotification(`Ошибка: ${result.stderr}`, 'error');
  }
} catch (e) {
  console.error('Команда заблокирована или отклонена:', e.message);
}
```

### `startProcess(request)` / `stopProcess(processId)`
Управление фоновыми демонами и серверами разработки:

```javascript
const proc = await window.ConfigStudio.startProcess({
  pluginId: 'my-plugin',
  command: 'python',
  args: ['-m', 'http.server', '8085'],
  port: 8085
});

// Завершение процесса
await window.ConfigStudio.stopProcess(proc.id);
```

---

## 13. Параметры и настройки плагина

Плагины могут предоставлять настройки для пользователей в окне настроек редактора:

```javascript
// Регистрация кастомного рендерера страницы настроек плагина
window.ConfigStudio.registerPluginSettings('my-plugin', {
  render: (container) => {
    container.innerHTML = `
      <div class="space-y-4">
        <h4 class="text-sm font-semibold">Параметры My Plugin</h4>
        <label class="flex items-center gap-2 text-xs">
          <input type="checkbox" id="auto-sync-opt" class="rounded border-base">
          Автосинхронизация при сохранении
        </label>
      </div>
    `;
  }
});

// Чтение и сохранение настроек
const config = await window.ConfigStudio.getPluginSettings('my-plugin');
await window.ConfigStudio.savePluginSettings('my-plugin', { autoSync: true });
```

---

## 14. Аудит, логирование и телеметрия ошибок

Плагины могут фиксировать события в системном журнале и отправлять отчеты об ошибках:

```javascript
// Запись события в системный журнал Config Studio
window.ConfigStudio.telemetry.log('plugin_action', { action: 'deploy_started', host: 'node-01' }, 'info');

// Перехват и логирование ошибок
try {
  // критическая операция
} catch (err) {
  window.ConfigStudio.telemetry.captureError(err, { context: 'deployment_phase' });
}
```
