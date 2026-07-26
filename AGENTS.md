# Umbot Flow Editor — Project Knowledge Base

## Overview

Visual flow editor for building umbot chatbots. Users create bots by placing blocks on a canvas and connecting them. The editor generates JSON which can be converted to a complete umbot project via CLI.

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
repos/umbot-flow-editor/
├── src/
│   ├── i18n/                        # Translations (ru.ts, en.ts)
│   ├── types/
│   │   └── flow.ts                  # TypeScript types for flow nodes
│   ├── store/
│   │   ├── flowStore.ts             # Graph state (nodes, edges, metadata)
│   │   └── uiStore.ts               # UI state (selection, locale, modals)
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── FlowCanvas.tsx       # Main canvas with React Flow
│   │   │   ├── ContextMenu.tsx      # Right-click context menu
│   │   │   ├── nodes/               # Node renderers (Command, Step, Action, etc.)
│   │   │   └── edges/               # Edge renderers
│   │   ├── Sidebar/
│   │   │   └── Sidebar.tsx          # Node palette for drag-and-drop
│   │   ├── Properties/
│   │   │   ├── PropertiesPanel.tsx   # Main panel (docked/floating)
│   │   │   ├── CommandProps.tsx      # Command node properties
│   │   │   ├── StepProps.tsx         # Step node properties
│   │   │   ├── ActionProps.tsx       # Action node properties (STANDALONE)
│   │   │   ├── ConditionProps.tsx    # Condition node properties
│   │   │   ├── ResponseProps.tsx     # Response node properties
│   │   │   ├── ActionEditor.tsx      # Inline action editor (for Command/Step)
│   │   │   ├── ConditionEditor.tsx   # Inline condition editor (for Command/Step)
│   │   │   ├── CardEditor.tsx        # Card/gallery editor
│   │   │   └── shared/              # Shared components
│   │   │       ├── Field.tsx         # Label + help wrapper
│   │   │       ├── ResponseText.tsx  # VariablePicker with label
│   │   │       ├── TTSField.tsx      # TTS textarea
│   │   │       ├── VariableConfig.tsx # Variable name + comment + presets
│   │   │       ├── HttpConfig.tsx    # HTTP method/URL/saveResponseTo
│   │   │       ├── ActionBlockEditor.tsx # Общий редактор блоков действий (shared)
│   │   │       └── AdvancedSettings.tsx # Collapsible advanced options
│   │   ├── Preview/
│   │   │   ├── ChatPreview.tsx       # Chat simulator
│   │   │   └── MessageBubble.tsx     # Message rendering
│   │   ├── Toolbar/
│   │   │   ├── Toolbar.tsx           # Top toolbar
│   │   │   └── ExportDialog.tsx      # Export modal
│   │   ├── Settings/
│   │   │   ├── BotSettingsModal.tsx   # Bot settings modal
│   │   │   └── DatabaseSettings.tsx   # DB settings (legacy, now in modal)
│   │   ├── Help/
│   │   │   └── HelpModal.tsx         # Help documentation
│   │   └── ui/
│   │       ├── TagInput.tsx           # Tag-style input
│   │       ├── HelpButton.tsx         # "?" help button
│   │       ├── VariablePicker.tsx     # Variable picker dropdown
│   │       ├── NodeSelector.tsx       # Node selector dropdown
│   │       └── PlatformSelector.tsx   # Platform multi-select
│   ├── utils/
│   │   ├── validator.ts              # JSON schema + graph validation
│   │   └── templateGenerator.ts      # JSON → umbot project code
│   ├── schemas/
│   │   └── flow.schema.json          # JSON Schema
│   └── __tests__/                    # Unit tests
└── package.json
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

| Node      | Color Variable   | CSS Value |
| --------- | ---------------- | --------- |
| Command   | --node-command   | #3B82F6   |
| Step      | --node-step      | #F97316   |
| Action    | --node-action    | #14B8A6   |
| Condition | --node-condition | #A855F7   |
| Response  | --node-response  | #6366F1   |
| End       | --node-end       | #EF4444   |

## State Management

- **flowStore.ts** — nodes, edges, metadata, addNode, removeNode, duplicateNode, pasteNode
- **uiStore.ts** — selectedNodeId, selectedEdgeId, propertiesPanelMode (docked/floating), activePreviewNodeId, botSettingsOpen, minimapVisible

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
4. **sanitizeIdentifier** — имена блоков с пробелами/спецсимволами/кириллицей заменяются на `_`. Цифры в начале — префикс `_`.
5. **safeVar** — имена переменных, начинающиеся с цифры, оборачиваются в скобки: `ctrl.userData['123']`.
6. **resolveVars** — сортировка по длине (длинные имена первые) + `escapeRegExp` для предотвращения partial match (user/userName).
7. **HTTP body с {{variables}}** — передаётся как template literal, а НЕ через JSON.parse.
8. **filterValidNodes** — null/undefined узлы фильтруются перед обработкой.
9. **Package name** — начинается с буквы, без спецсимволов, валидный npm identifier.
10. **random_number min/max** — используют `??` (nullish coalescing), а не `||`, чтобы `min: 0` работал корректно.

## Testing

```bash
npm run build    # TypeScript + Vite build
npm run test     # Vitest tests
npm run lint     # ESLint
```

## File Naming Convention

- Components: PascalCase (e.g., `CommandNode.tsx`)
- Utils: camelCase (e.g., `templateGenerator.ts`)
- Tests: `*.test.ts`
- i18n keys: dot notation (e.g., `sidebar.command.label`)
