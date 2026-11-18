# Упаковка, Публикация и Бинарный формат .cspkg 📦

Когда ваш плагин готов, вы можете распространять его среди пользователей через официальный каталог, прямые ссылки на GitHub, ZIP-архивы или современный бинарный пакет `.cspkg`.

---

## 1. Структура репозитория на GitHub

Создайте отдельный публичный репозиторий на GitHub (например, `https://github.com/username/config-studio-my-plugin`).

```
config-studio-my-plugin/
├── .gitignore
├── README.md               # Описание, скриншоты, инструкции
├── plugin.json             # Обязательный манифест
├── main.js                 # Точка входа JavaScript
├── style.css               # Стили (если используются)
├── local.json              # Внешний словарь локализации или языкового пакета (v2.3.6+)
├── agents/                 # Скомпилированные бинарники агента (опционально для fleet-плагинов)
│   ├── config-studio-agent-linux-amd64
│   └── config-studio-agent-linux-arm64
└── locales/                # Словари перевода (опционально)
    ├── ru.json
    └── en.json
```

---

## 2. Способы установки плагинов в Config Studio

1. **В 1 клик из каталога:**
   В окне «Настройки» → вкладка «Плагины» выберите нужное расширение из официального или подключенного стороннего каталога.
2. **Бинарный пакет `.cspkg`:**
   Перетащите файл `.cspkg` в окно настроек. Ядро смонтирует пакет в память на лету.
3. **По ссылке на GitHub:**
   Вставьте ссылку вида `https://github.com/username/config-studio-my-plugin` во вкладку «По ссылке».
4. **Установка из ZIP-архива:**
   Перетащите `.zip` архив в окно настроек. Ядро безопасно проинспектирует архив в изолированной папке, покажет экран согласия и установит плагин.
5. **Папка разработчика (Dev Mode):**
   Поместите распакованную папку в `data/plugins/<id>/` для мгновенной правки кода без перезагрузки.

---

## 3. Переносимость рабочего места: Экспорт и Импорт профиля

Config Studio поддерживает перенос окружения между рабочими компьютерами и серверами:
- Во вкладке настроек **«Профиль и Источники»** можно в 1 клик скачать файл `config-studio-profile.json`.
- Профиль содержит: список установленных плагинов, тему оформления, подключенные каталоги и настройки Deep Guard.
- **100% Zero-Secret Гарантия:** Пароли и SSH-ключи никогда не попадают в файл профиля.
- При импорте профиля на новом компьютере Config Studio показывает окно предпросмотра и автоматически скачивает все недостающие плагины из каталогов.

---

## 4. 📦 Бинарный формат пакета `.cspkg` и утилита `cspkg`

Config Studio использует архитектуру распространения плагинов в виде **единых компактных бинарных библиотек `.cspkg`** (Config Studio Package), вдохновленную форматом **MRS (Meta Rule Set)** из проекта *Clash.Meta / Mihomo*:

### Преимущества бинарного контейнера `.cspkg`:
1. **Zero-Disk / In-Memory Execution:** Ядро считывает и отдает файлы плагина (`main.js`, `style.css`, локали) на лету прямо из `.cspkg` в память. Никакой распаковки на диск, никакого мусора из сотен временных файлов в `data/plugins/`.
2. **Мгновенный старт:** Загрузка и валидация манифеста плагина занимают меньше 0.5 миллисекунды.
3. **Целостность и безопасность:** Заголовок защищен Magic Bytes `CSPK\x01`, 32-байтным SHA-256 хешем содержимого и проверкой манифеста `plugin.json`.
4. **Экстремальная компактность:** Встроенное сжатие Deflate уменьшает размер пакета до 5–25 КБ (без агентов) или оптимально упаковывает бинарники агента.
5. **Zero External Dependencies:** Утилита написана исключительно на стандартной библиотеке Go без CGO.

---

### Скачивание автономного компилятора `cspkg`

Готовые исполняемые файлы компилятора доступны в [Релизах репозитория документации](https://github.com/config-studio/config-studio-plugin-docs/releases/tag/v1.0.0):

| Платформа | Ссылка на скачивание |
| :--- | :--- |
| **Windows x64** | [`cspkg-windows-amd64.exe`](https://github.com/config-studio/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-windows-amd64.exe) |
| **Linux x64** | [`cspkg-linux-amd64`](https://github.com/config-studio/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-linux-amd64) |
| **macOS Apple Silicon (M1/M2/M3)** | [`cspkg-darwin-arm64`](https://github.com/config-studio/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-darwin-arm64) |
| **macOS Intel x64** | [`cspkg-darwin-amd64`](https://github.com/config-studio/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-darwin-amd64) |

#### Быстрая установка на Linux / macOS:
```bash
sudo curl -sSL -f https://github.com/config-studio/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-linux-amd64 -o /usr/local/bin/cspkg
sudo chmod +x /usr/local/bin/cspkg
cspkg version
```

---

### Команды CLI-утилиты `cspkg`

```bash
# 1. Упаковка папки плагина в бинарник .cspkg
cspkg pack ./my-plugin
# или с явным указанием имени выходного файла:
cspkg pack ./my-plugin -o my-plugin-1.0.0.cspkg

# 2. Инспекция манифеста, SHA-256 и списка файлов внутри .cspkg
cspkg inspect my-plugin-1.0.0.cspkg

# 3. Валидация целостности пакета (проверка SHA-256 и структуры)
cspkg validate my-plugin-1.0.0.cspkg

# 4. Распаковка содержимого .cspkg обратно в папку
cspkg unpack my-plugin-1.0.0.cspkg -o ./extracted_folder
```

---

## 5. 🤖 Встроенные агенты: Smart Plugin-Embedded Distribution

Если ваш плагин управляет серверами и развертывает удаленных агентов:
1. Поместите скомпилированные бинарники агента в папку `agents/`:
   - `agents/config-studio-agent-linux-amd64`
   - `agents/config-studio-agent-linux-arm64`
2. Объявите секцию `agent` в `plugin.json` с SHA-256 хешами:
```json
"agent": {
  "version": "2.3.0",
  "commit": "1fe3dc3",
  "binaries": {
    "linux-amd64": {
      "path": "agents/config-studio-agent-linux-amd64",
      "sha256": "32134f049e8760c7c9bf78c57ff707ad808e6504ce6ada69e60badc5c66e32a4"
    },
    "linux-arm64": {
      "path": "agents/config-studio-agent-linux-arm64",
      "sha256": "0b0b53947e9dcdc00d6ef8dd6d55a43f8a04b4d2589c60fd8e21dbe78afa22f2"
    }
  }
}
```
3. При сборке через `cspkg pack .` утилита упакует бинарники внутрь контейнера.
4. При развертывании ядро Config Studio пересылает агент прямо из `.cspkg` на сервер по SFTP, не требуя выхода в интернет на стороне сервера (Air-Gapped Ready).

---

## 6. 🚀 Автоматизация релизов через GitHub Actions

Чтобы при каждом обновлении версии плагина бинарный пакет `.cspkg` собирался и прикреплялся к GitHub Release автоматически, создайте в вашем репозитории файл `.github/workflows/release.yml`:

```yaml
name: Build and Release Plugin Package

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install cspkg packager
        run: |
          sudo curl -sSL -f https://github.com/config-studio/config-studio-plugin-docs/releases/download/v1.0.0/cspkg-linux-amd64 -o /usr/local/bin/cspkg
          sudo chmod +x /usr/local/bin/cspkg
          cspkg version

      - name: Compile .cspkg binary package
        run: |
          PLUGIN_ID=$(jq -r '.id' plugin.json)
          PLUGIN_VERSION=$(jq -r '.version' plugin.json)
          echo "Building package for ${PLUGIN_ID} v${PLUGIN_VERSION}..."
          cspkg pack . -o "${PLUGIN_ID}-${PLUGIN_VERSION}.cspkg"
          cspkg inspect "${PLUGIN_ID}-${PLUGIN_VERSION}.cspkg"

      - name: Create ZIP fallback
        run: |
          PLUGIN_ID=$(jq -r '.id' plugin.json)
          PLUGIN_VERSION=$(jq -r '.version' plugin.json)
          zip -r "${PLUGIN_ID}-${PLUGIN_VERSION}.zip" . -x "*.git*" "*.github*" "*.cspkg" "*.zip"

      - name: Publish GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            *.cspkg
            *.zip
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 7. Добавление плагина в Официальный Каталог

Центральный каталог расширений Config Studio работает на базе **GitHub Pages** в репозитории [config-studio-plugins](https://github.com/config-studio/config-studio-plugins).

> 🛡️ **Zero-Binary Policy:** Репозиторий каталога не содержит бинарных файлов `.cspkg` в git. Все бинарные пакеты распространяются исключительно через официальные GitHub Releases соответствующих репозиториев расширений (`downloadUrl`).

Каталог хранит легковесный индекс `registry.json` и выступает указателем на последний релиз каждого расширения. Таким образом, плагины развиваются полностью независимо в собственных репозиториях.

### Как добавить свой плагин:
Создайте Pull Request в репозиторий [config-studio-plugins](https://github.com/config-studio/config-studio-plugins), добавив ваш плагин в `registry.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin Name",
  "version": "1.0.0",
  "description": "Short description of what the plugin does",
  "author": "Your Name / Organization",
  "icon": "sparkles",
  "downloadUrl": "https://github.com/your-username/config-studio-my-plugin/releases/download/v1.0.0/my-plugin-1.0.0.cspkg",
  "homepage": "https://github.com/your-username/config-studio-my-plugin",
  "official": true,
  "locales": {
    "ru": {
      "name": "Мой плагин",
      "description": "Краткое описание на русском"
    },
    "en": {
      "name": "My Plugin Name",
      "description": "Short description in English"
    }
  },
  "minAppVersion": "2.3.6",
  "tags": ["Tool", "Automation"]
}
```
