# Разработка

Нужен Node.js 22+ (стоит в `C:\Program Files\nodejs`). Electron скачивается при `npm install`; если его нет — `node node_modules/electron/install.js`.

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Приложение с горячей перезагрузкой (то же — `start.cmd`) |
| `npm run dev:web` | Интерфейс в браузере на http://localhost:5199 без Electron. Данные — из `samples/private/characters.json`, если есть, иначе из файла оверлея (`A2BH_LIVE=1` — всегда из оверлея). Настройки и гайды — в localStorage браузера |
| `npm test` | Тесты логики (vitest) |
| `npm run typecheck` | Проверка типов main + renderer |
| `npm run shots` | Сборка и автоскриншоты всех экранов в `out/shots` (временная папка настроек, реальные данные оверлея). В другой теме и масштабе: `A2BH_SHOTS_UI='{"base":"asmodae","accent":"#e0525e","zoom":1.25}' node scripts/shots.mjs` |
| `A2BH_SHOTS_SETTINGS=1 node scripts/shots.mjs` | То же, но с вашими настройками (гайд, отметки специализаций, названия), масштаб 100% |
| `npm run format` | Prettier |
| `npm run build` | Сборка в `out/` |
| `npm run gamedata` | Обновить справочники и данные топ-игроков (см. [data-sources.md](data-sources.md)); разбор страниц — `scripts/gamedata/parsers.mjs` |
| `npm run art` | Скачать арт игры по списку `src/shared/gamedata/art.json` в `src/renderer/public/art` |
| `npm run icon` | Перерисовать `build/icon.png` и `build/icon.ico` |
| `npm run shortcut` | Ярлык на рабочем столе и в «Пуске» (запускает `Aion2BuildHelper.vbs`: сборка + запуск без консоли) |
| `npm run dist` | Собрать установщик `dist\Aion2BuildHelper-Setup-<версия>.exe` (ничего не выкладывает) |
| `npm run release` | Собрать и выпустить новую версию на GitHub — установленные копии обновятся сами (см. ниже) |

Скриншоты (`devShots.ts`) после смены раздела ждут, пока сменится заголовок страницы, — иначе снимок мог достаться прошлой странице.

## Как проверить изменение

1. `npm run typecheck && npm test`.
2. Интерфейс: `npm run shots` → PNG в `out/shots`. Или `npm run dev:web` и `http://localhost:5199/?static#/arcana` — `?static` выключает анимации (в фоновой вкладке браузера они замирают на середине).
3. Реальные данные: скопируйте `%APPDATA%\Questlog\aion-2\characters.json` в `samples/private/` (папка не в git) и запустите
   `SHOW=1 npx vitest run src/shared/analysis/real.test.ts --silent=false` — напечатает оценки, шаги, арканы и цели досок.

## Где данные приложения

`%APPDATA%\Aion2 Build Helper` — настройки, свои гайды, история и снимки. Кнопка «Папка с данными приложения» в настройках.

## Выпуск версии

Установленные копии (у вас и у друзей) сами находят новую версию в выпусках GitHub, скачивают её и ставят при перезапуске. Как это устроено — [decisions/0007](decisions/0007-installer-and-updates.md).

**Один раз — ключ GitHub для выкладки.** GitHub → аватар → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**:
- *Token name*: `Aion2 Build Helper: выпуск`; *Expiration*: например, год;
- *Repository access*: **Only select repositories** → `VorotnikovAndrey/Aion2BuildHelper`;
- *Permissions* → *Repository permissions* → **Contents: Read and write** (Metadata: Read-only добавится сам);
- **Generate token**, скопировать ключ (`github_pat_…`) — второй раз GitHub его не покажет.

Положите ключ в файл `%USERPROFILE%\.aion2buildhelper-release\release-token.txt` (одна строка, вне папки проекта — в git он не попадёт). Тогда `npm run release` ничего не спрашивает, и выпуск может сделать AI-агент по вашей просьбе. Без файла скрипт спросит ключ или возьмёт его из переменной `GH_TOKEN`.

**Каждый выпуск:**
1. Поднять `version` в `package.json` и добавить в `CHANGELOG.md` раздел `## <версия> — <дата>` — он станет «Что нового» в приложении.
2. Закоммитить и отправить (`git push`).
3. `npm run release` — соберёт установщик и выложит выпуск `v<версия>`.

**Дать программу человеку:** ссылка https://github.com/VorotnikovAndrey/Aion2BuildHelper/releases/latest → файл `Aion2BuildHelper-Setup-<версия>.exe`. Установщик не подписан: Windows покажет «Система Windows защитила ваш компьютер» → **Подробнее** → **Выполнить в любом случае**. Ещё человеку нужен оверлей Questlog — приложение берёт персонажа из его файла.

## Новый класс

1. `npm run gamedata -- --classes <класс>` — специализации, доски, иконки умений, данные топ-игроков (сейчас собраны все 8 классов).
2. Русские названия умений — `src/shared/gamedata/skills-ru.json` (из базы Questlog на русском, все классы); поправки — `RU_OVERRIDES` в `skills.ts`; специализации — `SPEC_RU` (пока только страж).
3. Гайд — в редакторе или JSON (см. [guides.md](guides.md)); встроенный — в `src/shared/guide/builtin/` и в `BUILTIN_GUIDES`.
