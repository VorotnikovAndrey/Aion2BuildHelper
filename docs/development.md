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
| `npm run gamedata` | Обновить справочники (см. [data-sources.md](data-sources.md)) |
| `npm run art` | Скачать арт игры по списку `src/shared/gamedata/art.json` в `src/renderer/public/art` |
| `npm run icon` | Перерисовать `build/icon.png` и `build/icon.ico` |
| `npm run shortcut` | Ярлык на рабочем столе и в «Пуске» (запускает `Aion2BuildHelper.vbs`: сборка + запуск без консоли) |

Скриншоты (`devShots.ts`) после смены раздела ждут, пока сменится заголовок страницы, — иначе снимок мог достаться прошлой странице.

## Как проверить изменение

1. `npm run typecheck && npm test`.
2. Интерфейс: `npm run shots` → PNG в `out/shots`. Или `npm run dev:web` и `http://localhost:5199/?static#/arcana` — `?static` выключает анимации (в фоновой вкладке браузера они замирают на середине).
3. Реальные данные: скопируйте `%APPDATA%\Questlog\aion-2\characters.json` в `samples/private/` (папка не в git) и запустите
   `SHOW=1 npx vitest run src/shared/analysis/real.test.ts --silent=false` — напечатает оценки, шаги, арканы и цели досок.

## Где данные приложения

`%APPDATA%\Aion2 Build Helper` — настройки, свои гайды, история и снимки. Кнопка «Папка с данными приложения» в настройках.

## Новый класс

1. `npm run gamedata -- --classes <класс>` — специализации и доски.
2. Русские названия умений — в `src/shared/gamedata/skills.ts` (`RU_BY_ID`) и специализаций (`SPEC_RU`), если нужны.
3. Гайд — в редакторе или JSON (см. [guides.md](guides.md)); встроенный — в `src/shared/guide/builtin/` и в `BUILTIN_GUIDES`.
