# Umbot Flow — Project Knowledge Base

## Overview

Visual Flow for building umbot chatbots. Users create bots by placing blocks on a canvas and connecting them. The editor generates JSON which can be converted to a complete umbot project via CLI (`npx umbot create from-flow flow.json`).

**Два входа** (не забыть при деплое и тестах):
- `/` — статический лендинг (`index.html`, ~1400 строк, без React)
- `/app` — React-редактор (`app.html`, монтируется в `#root`)
Локальная проверка редактора: `npm run dev` → http://localhost:3001/app (не `/`!).

## Architecture

### Tech Stack

| Layer       | Technology             |
| ----------- | ---------------------- |
| UI          | React 18 + TypeScript  |
| Node Editor | React Flow 12 (xyflow) |
| State       | Zustand                |
| Styling     | Tailwind CSS           |
| Build       | Vite                   |
| Validation  | AJV + JSON Schema      |
| Testing     | Vitest                 |

### Project Structure

```
umbot-flow/
├── index.html                      # Лендинг (статика, без React)
├── app.html                        # Редактор: точка монтирования React (#root)
├── styles/                         # CSS статических страниц: landing.css, easter/*.css (terminal.css — общий для secret/confession), um13-ghost.css — стили призрака
├── scripts/                        # JS статических страниц (ES-модули): landing.js, easter/*.js (um13.js — общая память UM-13)
├── public/docs/                    # Статическая документация (ru/en)
├── public/docs/docs.css            # Общие стили документации (без хэша: при правке поднять ?v=N)
├── public/metrika.js               # Яндекс.Метрика для всех страниц
├── ROADMAP.md                      # Хотелки/доработки (приоритизировано)
├── UX_AUDIT.md                     # Прошлый UX-аудит (большинство пунктов закрыто)
├── BUGREPORT_cli_step_lowercase.md # Открытый баг CLI фреймворка (регистр ввода)
└── src/
    ├── main.tsx                    # Монтирование React (ErrorBoundary + StrictMode)
    ├── App.tsx                     # Layout + глобальные хоткеи + flushSave на pagehide
    ├── i18n/                       # ru.ts, en.ts (406+ ключей, полная парность), hook.ts
    ├── types/
    │   ├── flow.ts                 # Типы нод/документа + DEFAULT_METADATA
    │   ├── nodes.ts                # to/fromReactFlowEdge
    │   └── operators.ts            # Пресеты условий
    ├── store/
    │   ├── flowStore.ts            # Граф + undo/redo + автосейв (см. State Management)
    │   ├── uiStore.ts              # UI-состояние (persist middleware)
    │   └── validationStore.ts      # Ошибки валидации по nodeId
    ├── hooks/                      # useDebouncedValue, useNodeFieldErrors, useValidationDoc
    ├── utils/
    │   ├── validator.ts            # AJV-схема + графовые проверки (DUPLICATE_SANITIZED_NAMES и др.)
    │   ├── templateGenerator.ts    # JSON → TypeScript-код проекта
    │   ├── identifiers.ts          # isValidJSIdentifier + sanitizeIdentifier (единый источник!)
    │   ├── projectsStore.ts        # Недавние проекты + evictProjectsForSpace (квота)
    │   ├── starterDoc.ts           # Демо-флоу (локализуется по локали!)
    │   ├── safeMath.ts             # Парсер арифметики без eval
    │   └── regex.ts                # Общие константы регулярок
    ├── components/                  # (структура ниже)
    ├── schemas/flow.schema.json    # JSON Schema (schemaVersion: const "1.0")
    └── __tests__/                   # Vitest: generator, validator, storage, previewScenario, ...
```

## Key Component Relationships

### Properties Panel Architecture

```
PropertiesPanel.tsx (docked/floating)
├── CommandProps.tsx
│   ├── Field.tsx (shared)
│   ├── ResponseText.tsx (shared)
│   ├── TTSField.tsx (shared)
│   ├── VariableConfig.tsx (shared) ← variable name + comment + presets
│   ├── AdvancedSettings.tsx (shared) ← actions, conditions, emotion, etc.
│   ├── ActionEditor.tsx (inline actions)
│   ├── ConditionEditor.tsx (inline conditions)
│   └── CardEditor.tsx
├── StepProps.tsx
│   └── (same structure as CommandProps)
├── ActionProps.tsx ← STANDALONE action block properties
│   ├── VariableConfig.tsx (shared) ← variable name + comment + presets
│   ├── HttpConfig.tsx (shared) ← HTTP method/URL/save
│   ├── ResponseText.tsx (shared)
│   └── NodeSelector.tsx
├── ConditionProps.tsx
└── ResponseProps.tsx
```

### Shared Components (shared/)

- **Field.tsx** — Label + HelpButton wrapper
- **ResponseText.tsx** — VariablePicker with label
- **TTSField.tsx** — TTS textarea
- **VariableConfig.tsx** — Variable name input + comment + presets (used in Command, Step, AND Action)
- **HttpConfig.tsx** — HTTP method/URL/saveResponseTo (used in ActionProps and ActionEditor)
- **ActionBlockEditor.tsx** — Общий редактор блоков действий. Используется и ActionProps (standalone), и ActionEditor (inline). Гарантирует идентичный внешний вид.
- **AdvancedSettings.tsx** — Collapsible section with emotion, end dialog, shuffle buttons

### Important: ActionProps vs ActionEditor

- **ActionProps.tsx** — Properties for standalone Action node (dragged to canvas)
- **ActionEditor.tsx** — Inline editor for actions inside Command/Step nodes

Both MUST use the same VariableConfig component for consistency.

## Node Types and Colors

Цвета нод заданы CSS-переменными `--node-*` в `src/index.css` (отдельные значения для тёмной и светлой темы). Единственный источник правды в коде — `src/components/Canvas/nodes/nodeColors.ts` (`NODE_COLORS[type].cssVar` + хелпер `nodeColorAlpha(type, percent)` через `color-mix`). **Не хардкодить hex в компонентах.**

| Node      | CSS Variable     | Dark (неон) | Light (читаемый) |
| --------- | ---------------- | ----------- | ---------------- |
| Command   | --node-command   | #00f0ff     | #0891b2          |
| Step      | --node-step      | #bc13fe     | #9333ea          |
| Action    | --node-action    | #ff9d00     | #d97706          |
| Condition | --node-condition | #ff0055     | #e11d48          |
| Response  | --node-response  | #00ff9d     | #059669          |
| End       | --node-end       | #ef4444     | #dc2626          |
| Start     | --node-start     | #22c55e     | #16a34a          |
| Welcome   | --node-welcome   | #22c55e     | #16a34a          |
| Help      | --node-help      | #eab308     | #ca8a04          |
| Fallback  | --node-fallback  | #ff9d00     | #d97706          |

Тема переключается атрибутом `data-theme="light"` на `<html>` (см. `uiStore.applyTheme`) — CSS-переменные подхватываются автоматически.

## Design System (UI/UX conventions)

- **Шрифт** — Inter, подключён локально через `@fontsource/inter` (400/500/600/700, кириллица) в `main.tsx`.
- **Минимальный размер текста** — 11px (`text-[11px]`). Не использовать 9–10px.
- **Контраст вторичного текста** — не ниже `text-fg/50`. Для tertiary допустимо `/40`, но не `/20–/35`.
- **Модалки** — только через единый `ui/Modal.tsx` (overlay + анимация + ESC/click-outside). Кнопки-CTA — через `ui/PrimaryButton.tsx` (градиент accent→info). Не дублировать разметку модалок и не хардкодить градиент.
- **HelpButton / NodeHelpButton** — открывают лёгкий popover (портал в `body`), а не модалку. `HelpButton` рендерится с `z-alert`, чтобы быть поверх модалок.
- **Пульсация активной ноды** (`nodeActivePulse`) — ограничена 5 минутами (200 итераций × 1.5s, `forwards`), не бесконечная.
- **Transition** — в `.node-hover`/`.node-dimmed`/`.node-spotlight*` перечислены конкретные свойства (не `transition: all`).
- **Цвета рёбер** — через токены темы (`rgb(var(--fg-rgb) / …)`, `--success-rgb`, `--error-rgb`), адаптируются к теме.
- **Тулбар** — иконки без текстовых подписей (осознанное решение, не добавлять текст, чтобы не перегружать).

## State Management

- **flowStore.ts** — nodes, edges, metadata, addNode, removeNode, duplicateNode, pasteNode, undo/redo, автосохранение в localStorage
- **uiStore.ts** — selectedNodeId, selectedEdgeId, propertiesPanelMode (docked/floating), activePreviewNodeId, botSettingsOpen, minimapVisible, theme (dark/light через `data-theme`), locale
- **validationStore.ts** — результат единого прогона валидации (`nodeErrors` по id узла); заполняется в `Canvas/ValidationSync.tsx`, читается нодами (`useNodeErrors`), панелью свойств и StatusBar

### Автосохранение (честный индикатор)

- **`saveState`**: `'idle' | 'saving' | 'saved' | 'error'` — состояние **по факту записи** в localStorage, не по факту изменения. StatusBar подписан на него; при `'error'` показывает красное «Не сохранено» с кликом → экспорт.
- **`persistNow()`** — синхронная запись. При `QuotaExceededError` вызывает `evictProjectsForSpace(bytes, currentProjectName)` из `projectsStore.ts`: удаляет самые старые снапшоты истории недавних проектов (текущий проект защищён), затем повторяет запись. Только после неудачной эвикции — `saveState: 'error'`.
- **`flushSave()`** — немедленная запись без debounce, вешается на `pagehide` и `visibilitychange→hidden` в App.tsx. Пишет только если есть pending-дебаунс (иначе no-op).
- **Undo-история** — модульные массивы вне стора (50 шагов), коалесцинг правок одной ноды одной формы патча в пределах 1 сек (`COALESCE_WINDOW_MS`) — один шаг undo на ввод текста. **Не переживает перезагрузку** (в ROADMAP).
- **`normalizeMetadata()`** — «чужой» документ без fallback/welcome/database не должен ронять UI: структурные дефолты из DEFAULT_METADATA, пользовательские тексты — пустые.
- **schemaVersion** — при несовпадении с `CURRENT_SCHEMA_VERSION` localStorage сбрасывается (миграций пока нет — см. ROADMAP #4).

### Превью (ChatPreview)

- **`buildInitialTurn(doc)`** (экспортируется, тестируется) — начальный ход: проигрывает цепочку от Welcome-ноды по next-рёбрам до первого Step, возвращает `{msgs, waitStep, vars}`. Используется при открытии превью и в handleReset. **Инвариант**: если Welcome связан со Step, превью обязано встать в ожидание ввода — иначе первый ответ пользователя уйдёт в fallback (это был баг, покрыт тестами в `previewScenario.test.ts`).
- Внутри начальной цепочки Condition всегда идёт по `branch_false` (переменные ещё пусты).
- Предохранитель от циклов: `safety < 50` и в `buildInitialTurn`, и в `processChain`.
- HTTP в превью — честная заглушка: сообщение «(имитация)» + мок-значение в saveResponseTo.

## How umbot Works (for code generation)

### Two Handler Types Only

1. `bot.addCommand(name, slots, handler)` — triggered by slot words
2. `bot.addStep(name, handler)` — triggered by thisIntentName

Actions, conditions, responses are inline code inside these handlers.

### Standalone Nodes as Steps

Response, Action, Condition узлы, подключённые через edges (next, branch_true, branch_false), генерируются как `addStep` обработчики. Ключевые правила:

- **Response блок** → `addStep(name, (ctrl) => { setText/setTTS/isEnd/buttons })`
- **Action блок** → `addStep(name, [async] (ctrl) => { actions/text/buttons })`
- **Condition блок** → `addStep(name, (ctrl) => { switch-case + if(result)/if(!result) navigation })`
- **End блоки** пропускаются (не генерируют обработчик)

### Code Generation Quality Rules

1. **setTTS импорт** — только если хотя бы один узел (command, step, standalone response) имеет `tts`. Проверяется через `hasTTSInDoc()`.
2. **Text импорт** — только если есть conditions с isSayTrue/isSayFalse/isUrl операторами.
3. **rand импорт** — только если есть `random_number` действия.
4. **sanitizeIdentifier** — импортируется из `utils/identifiers.ts` (ЕДИНЫЙ источник для генератора и валидатора; локальные копии запрещены). Имена блоков с пробелами/спецсимволами заменяются на `_`, кириллица сохраняется (`\p{L}`), цифры в начале — префикс `_`.
5. **Коллизии санитизированных имён** — валидатор ловит кодом `DUPLICATE_SANITIZED_NAMES` («my cmd» и «my-cmd» → оба `my_cmd`). Role-ноды (welcome/help/fallback) исключены из проверки.
6. **Инлайн-условия** — каждое условие внутри ноды оборачивается в собственный блок `{}` (регрессия: дубль `const condVar` ломал компиляцию при 2+ условиях; тесты в templateGenerator.test.ts).
7. **Role-ноды (welcome/help/fallback)** — НЕ генерируют `addCommand`: их тексты идут в `setPlatformParams`/`FALLBACK_COMMAND` через `collectRoleTexts(doc, validNodes)` (нода приоритетнее metadata; пустой текст ноды не затирает непустой текст настроек). Отдельный `addCommand('welcome')` был мёртвым кодом, `addCommand('fallback')` перетирался поздним `FALLBACK_COMMAND`.
8. **safeVar** — имена переменных, начинающиеся с цифры, оборачиваются в скобки: `ctrl.userData['123']`.
9. **resolveVars** — сортировка по длине (длинные имена первые) + `escapeRegExp` для предотвращения partial match (user/userName).
10. **HTTP body с {{variables}}** — передаётся как template literal, а НЕ через JSON.parse.
11. **filterValidNodes** — null/undefined узлы фильтруются перед обработкой (ВСЕ циклы генератора и валидатора должны идти по validNodes — включая новые хелперы!).
12. **Package name** — начинается с буквы, без спецсимволов, валидный npm identifier.
13. **random_number min/max** — используют `??` (nullish coalescing), а не `||`, чтобы `min: 0` работал корректно.

### Известное расхождение с CLI фреймворка

CLI (`umbot/cli/flowGenerator.js`) — **отдельная реализация** от нашего `templateGenerator.ts`. Известный баг CLI: для `saveAs: 'original'` генерирует `ctrl.userCommand` (нижний регистр от адаптеров) вместо `ctrl.originalUserCommand` — см. `BUGREPORT_cli_step_lowercase.md`. Редактор это обойти не может, фикс на стороне фреймворка.

## Testing

```bash
npm run build    # TypeScript + Vite build
npm run test     # Vitest tests (~215)
npm run lint     # ESLint
```

Наборы тестов (`src/__tests__/`):
- `templateGenerator.test.ts` — кодоген (включая регрессии: блоки-обёртки условий, role-ноды)
- `validator.test.ts` — схема + граф (включая DUPLICATE_SANITIZED_NAMES)
- `storage.test.ts` — saveState, эвикция при квоте, flushSave
- `previewScenario.test.ts` — buildInitialTurn (welcome-цепочка) + локализация стартера
- `flowStore.test.ts`, `safeMath.test.ts`, `performance.test.ts`, UI-смоуки

Правила:
- Новый фикс сопровождается тестом, ловящим регрессию (см. блоки `{}` у инлайн-условий).
- Тесты стора требуют `vi.useFakeTimers()` для debounce-логики (SAVE_DELAY=300 мс);
  при fake timers у `Date.now()` одинаковые метки — учитывается тай-брейком эвикции.
- Тесты UI-обновлений Zustand вне React-событий оборачивать в `act()`.
- E2E (Playwright) пока нет — ROADMAP #2.

## File Naming Convention

- Components: PascalCase (e.g., `CommandNode.tsx`)
- Utils: camelCase (e.g., `templateGenerator.ts`)
- Tests: `*.test.ts`
- i18n keys: dot notation (e.g., `sidebar.command.label`)
- i18n: **полная парность RU/EN ключей обязательна** (сейчас 406+; проверять при добавлении)

## Критичные инварианты (не нарушать)

1. **Позиции нод не входят в `toJSON()`** — FlowDocument без layout; `fromJSON` перестраивает авто-раскладкой. Изменение формата — только с миграцией (ROADMAP #5).
2. **Демо-контент локализуется**: `buildStarterDocument(locale)` —RU/EN тексты задаются вместе, иначе EN-пользователь получает русское демо.
3. **Превью должно проигрывать welcome-цепочку** (`buildInitialTurn`) — добавление новых типов нод требует поддержки и в `processChain`, и в `buildInitialTurn`, и в `templateGenerator` (три места дублируют логику обхода).
4. **Экранирование U+2028/U+2029** в `escapeStr` обязательно — эти символы реально ломают JS-строки.
5. **Кириллица — валидная часть имён блоков** (`\p{L}`): не «санитизировать в _», а честно обрабатывать (генерируется валидный TS).
6. **Clipboard может быть недоступен** (http-контекст) — все `navigator.clipboard.writeText` идут с `?.` и `.catch()` + fallback через localStorage (см. App.tsx Ctrl+C/V/X).
7. **`window.confirm`/`alert` запрещены** — только `ui/ConfirmDialog`/`ui/AlertDialog` (единый вид модалок).
8. **Не хардкодить hex цветов нод** — только `NODE_COLORS[type].cssVar`/`nodeColorAlpha()`.
9. **Фреймворк приводит `userCommand` к нижнему регистру** — превью и генератор редактора сохраняют оригинальный регистр; расхождение с CLI-генератором до фикса багрепорта (см. выше).
