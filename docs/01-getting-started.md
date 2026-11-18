# Быстрый старт: Создание первого плагина за 5 минут 🚀

Это руководство поможет вам с нуля создать, протестировать и установить свой первый плагин для **Config Studio** (v2.3.6+).

---

## 📁 Структура плагина

Минимальный плагин состоит всего из **двух файлов**:
```
my-first-plugin/
├── plugin.json    # Манифест с метаданными и разрешениями
└── main.js        # JavaScript код логики плагина
```
Опционально можно добавить:
- `style.css` — кастомные стили (автоматически подключаются в DOM приложения).
- `README.md` — описание и документация для пользователей.
- `local.json` / `localization.json` — *(v2.3.6+)* отдельный словарь локализации или языкового пакета без загромождения манифеста.
- `locales/` — папка со словарями локализации (`ru.json`, `en.json`).

---

## Шаг 1. Создание манифеста `plugin.json`

Создайте файл `plugin.json` в новой папке `my-first-plugin`:

```json
{
  "id": "my-first-plugin",
  "name": "Мой Первый Плагин",
  "version": "1.0.0",
  "description": "Приветственный плагин с кнопкой в тулбаре и уведомлениями",
  "author": "Ваше Имя",
  "icon": "smile",
  "entry": "main.js",
  "css": "style.css",
  "styles": ["style.css"],
  "permissions": ["ui.panels", "toolbar"],
  "minAppVersion": "2.3.6"
}
```

### Пояснения по полям:
- `id`: уникальный строковый идентификатор плагина (только латиница, цифры и дефис).
- `name`: название плагина, отображаемое в интерфейсе и каталоге.
- `version`: версия по стандарту SemVer (`1.0.0`).
- `entry`: точка входа JavaScript (относительно корня плагина).
- `css` / `styles`: пути к подключаемым файлам стилей.
- `permissions`: список запрашиваемых привилегий. Для элементов интерфейса достаточно `["ui.panels", "toolbar"]`.
- `minAppVersion`: минимальная совместимая версия ядра Config Studio (`2.3.6`).

---

## Шаг 2. Написание кода `main.js`

Создайте файл `main.js`. Код плагина выполняется в защищенном глобальном контексте браузера, поэтому рекомендуется оборачивать его в анонимную самовызывающуюся функцию (IIFE):

```javascript
(function() {
  const pluginId = 'my-first-plugin';

  // Проверяем доступность API редактора
  if (!window.ConfigStudio) {
    console.warn('[MyFirstPlugin] ConfigStudio API не найден.');
    return;
  }

  // 1. Регистрируем кнопку в верхней панели инструментов (Toolbar)
  window.ConfigStudio.registerToolbarButton({
    id: 'my-hello-btn',
    pluginId: pluginId,
    label: 'Привет',
    title: 'Нажмите, чтобы получить приветствие',
    icon: 'smile', // Имя иконки Lucide Icons
    visible: () => true,
    onClick: () => {
      // Получаем текущий активный файл в редакторе
      const file = window.ConfigStudio.getActiveFile();
      const fileName = file ? file.name : 'файл не открыт';

      // Показываем стильное всплывающее уведомление
      window.ConfigStudio.showNotification(
        `Привет из плагина! Сейчас открыт: ${fileName}`,
        'success'
      );
    }
  });

  // 2. Хуки жизненного цикла файлов (v2.3.6+)
  if (typeof window.ConfigStudio.onFileOpen === 'function') {
    window.ConfigStudio.onFileOpen((file) => {
      console.log(`[MyFirstPlugin] Файл открыт: ${file.name} (${file.path})`);
    });
  }

  if (typeof window.ConfigStudio.onFileSave === 'function') {
    window.ConfigStudio.onFileSave((file) => {
      console.log(`[MyFirstPlugin] Файл сохранен: ${file.name}`);
    });
  }

  console.log('[MyFirstPlugin] Плагин успешно инициализирован!');
})();
```

---

## Шаг 3. Добавление стилей `style.css` (опционально)

Создайте файл `style.css`:

```css
/* Пользовательские стили для элементов вашего плагина */
.my-custom-badge {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(0, 210, 180, 0.15);
  color: #00d2b4;
  font-size: 11px;
  font-weight: 600;
}
```

---

## Шаг 4. Установка и тестирование

Вы можете установить плагин любым из доступных способов:

### Способ 1. Прямое копирование в папку программы (Dev Mode)
Просто скопируйте папку `my-first-plugin` в директорию `data/plugins/` рядом с запущенным бинарником Config Studio:
```
data/
└── plugins/
    └── my-first-plugin/
        ├── plugin.json
        ├── main.js
        └── style.css
```
Перезапустите приложение или в окне **«Настройки» → вкладка «Плагины»** нажмите кнопку **«Обновить»** — плагин тут же появится в списке и активируется!

### Способ 2. Бинарный пакет `.cspkg` (Рекомендуется для релиза)
Скомпилируйте плагин официальной CLI-утилитой `cspkg`:
```bash
cspkg pack ./my-first-plugin -o my-first-plugin-1.0.0.cspkg
```
Перетащите полученный единый бинарный пакет в окно **«Настройки» → «Плагины»**. Ядро Config Studio смонтирует его прямо в оперативную память без распаковки на диск!

### Способ 3. Установка через ZIP-архив
1. Запакуйте файлы `plugin.json`, `main.js` и `style.css` в архив `my-first-plugin.zip`.
2. В Config Studio откройте **«Настройки» → вкладка «Плагины»**.
3. Перетащите архив в область загрузки или нажмите «Выбрать архив».

### Способ 4. Установка по ссылке с GitHub
Запушьте плагин в публичный репозиторий GitHub (например, `https://github.com/username/my-first-plugin`), вставьте ссылку в поле **«По ссылке (URL / GitHub)»** и нажмите **«Установить»**.

### Способ 5. Smart Plugin-Embedded Distribution (v2.3.1+)
Для плагинов, управляющих серверами и удаленными хостами (как `servers`), плагин может содержать скомпилированные бинарники демонов (`config-studio-agent` для `linux-amd64` и `linux-arm64`) прямо внутри `.cspkg`. Такие бинарники устанавливаются на целевые серверы по SFTP в один клик даже в изолированных средах без выхода в интернет (Air-Gapped).

Поздравляем! Ваш первый плагин готов и работает! 🎉
