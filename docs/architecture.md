# Архитектура DWC Engineering Workspace

Проект остаётся статическим приложением для GitHub Pages. Сайт в корне содержит существующий демо-сервис; `engineering.html` добавляет инженерный кабинет.

Основные файлы:
- `index.html`, `css/style.css`, `js/calculation.js`, `js/visualization.js`, `js/main.js` — сохраняемый демо-сервис;
- `engineering.html`, `css/workspace.css`, `js/engineering.js` — инженерный кабинет;
- `data/project-passport.json` — паспорт проекта;
- `data/results-status.json` — машиночитаемая система статусов;
- `docs/` — проектная документация.

Кабинет загружает JSON с помощью `fetch`, поэтому при локальном просмотре требуется HTTP-сервер. GitHub Pages поддерживает относительные ресурсы без сборки.

## Интеграция DWSIM/MCP

Конфигурация `.vscode/mcp.json` подключает MCP-сервер DWSIM по HTTP `http://localhost:5901/mcp`. Доступные операции описаны в `STATUS.md`. На текущем этапе процессор DistillationColumn не сходится, поскольку `dwsim_unitop_connect` не заполняет внутренние `StreamBehavior` и `AssociatedStage`.

Запрещено представлять отсутствие конвергенции как подтверждённый расчёт. В интерфейсе демо-показатели отделены от расчётно и экспериментально подтверждённых результатов.
