export default {
    // Sidebar
    'sidebar.nodes': 'BLOCKS',
    'sidebar.command.label': 'Command',
    'sidebar.command.desc': 'Response to trigger words',
    'sidebar.welcome.label': 'Start',
    'sidebar.welcome.desc': 'Bot greeting on launch',
    'sidebar.help.label': 'Help',
    'sidebar.help.desc': 'Response to help command',
    'sidebar.fallback.label': 'Fallback',
    'sidebar.fallback.desc': "Response when the bot didn't understand input",
    'help.welcomeDesc':
        'The "Start" block defines the greeting message sent when a user first interacts with the bot. Text is taken from bot settings.',
    'help.helpNodeDesc':
        'The "Help" block defines the response to the help command. Text is taken from bot settings.',
    'sidebar.step.label': 'Step',
    'sidebar.step.desc': 'Waits for reply \u2192 saves to field',
    'sidebar.condition.label': 'Condition',
    'sidebar.condition.desc': 'Branch by variable',
    'sidebar.end.label': 'End',
    'sidebar.end.desc': 'Terminate dialog',
    'sidebar.custom.label': 'Action',
    'sidebar.custom.desc': 'Perform action / HTTP request',
    'sidebar.response.label': 'Response',
    'sidebar.response.desc': 'Show text with variables, no input needed',
    'sidebar.howToUse': 'How to use',
    'sidebar.added': 'On canvas',
    'sidebar.alreadyAdded': 'Already on canvas',
    'sidebar.searchPlaceholder': 'Search blocks…',
    'sidebar.noResults': 'No blocks found',
    'sidebar.tip1': 'Drag a block to the canvas',
    'sidebar.tip2': 'Click a block to edit properties',
    'sidebar.tip3': 'Connect blocks by dragging edges',
    'sidebar.tip4': 'Press Delete to remove a block',

    // Properties panel
    'props.name': 'Name',
    'props.nameHelp':
        'Block name shown on the canvas. Any text is fine — it is converted to a system identifier on export.',
    'props.slots': 'Trigger words',
    'slots.tooltip':
        'Words that make the bot react to this command.\n\nHow to use:\n• Type a word and press Enter\n• Case-insensitive (hello = Hello = HELLO)\n• You can add multiple words\n\nNote: the command fires if the word APPEARS anywhere in the message. Short words like "yes" or "my" may trigger accidentally — choose unambiguous ones.',
    'props.slots.placeholder': 'Type a word and press Enter',
    'props.patternMode': 'Pattern mode',
    'props.patternHelp':
        'Allows complex recognition rules (regular expressions). For beginners — better to leave it off.',
    'props.responseText': 'Response text',
    'props.responseTextHelp': 'Use {{variable}} to substitute user data',
    'props.tts': 'Voice text',
    'props.ttsHelp':
        'Text the bot will speak aloud on voice platforms (Alisa, Marusia). If left empty, the main response text is spoken.',
    'props.ttsPlaceholder': 'Optional',
    'props.patternWarning':
        'Regular expressions define complex matching rules. If unsure, it is safer to leave this off.',
    'props.emotion': 'Emotion (SmartApp)',
    'props.endDialog': 'End dialog',
    'props.endDialogHelp': 'Close dialog after this response',
    'props.shuffleButtons': 'Random button order',
    'props.shuffleButtonsHelp':
        'Shuffle buttons before showing. Useful for quizzes and math games.',
    'props.advancedSettings': 'Advanced settings',
    'props.advancedHide': 'Hide advanced',
    'props.buttons': 'Buttons',
    'props.buttonsHelp':
        'Buttons under the response text. The user clicks — and the bot reacts.\n\nButton types:\n• Action — navigates to another block\n• Link — opens a URL in the browser',
    'props.addButton': 'Add button',
    'props.buttonTitle': 'Button text',
    'props.buttonAction': 'Action',
    'props.buttonLink': 'Link',
    'props.url': 'URL',
    'props.promptText': 'Reaction to the reply',
    'props.promptHelp':
        'Optional. Sent AFTER the user replies, {{variables}} allowed. Ask the question itself in the block before the step.',
    'props.varComment': 'Variable comment',
    'props.varCommentHelp': 'Description of the variable purpose (visible in data panel)',
    'props.nextStep': 'Next block',
    'props.nextStepHelp':
        'Where to go after this step. This is the same as an arrow on the canvas: picking a block here draws the arrow, and drawing an arrow fills this field. Leave "—" to end the dialog.',
    'props.operator': 'Operator',
    'props.variable': 'Variable',
    'props.variableHelp': 'Variable name to check',
    'props.comparisonValue': 'Comparison value',
    'tooltip.operator':
        'How to compare:\nEquals (=)\nNot equals (≠)\nGreater than (>)\nGreater than or equal (≥)\nLess than (<)\nLess than or equal (≤)\nContains\nEmpty / Not empty\nUser said "yes" / "no"\nIs a URL',
    'tooltip.variable': 'Name of the variable to check',
    'tooltip.variableIsUserInput':
        'This operator checks the last user response — you can leave the variable field empty.',
    'tooltip.comparisonValue':
        'Value to compare the variable against. Can be a number, text, or another variable name',
    'tooltip.field': 'Name of the field to store the result',
    'tooltip.responseText': 'Text the user will see. Use {{name}} to insert variables',
    'props.delete': 'Delete',
    'props.namePlaceholder': 'e.g. greeting',
    'props.fieldPlaceholder': 'e.g. userName',
    'props.httpUrl': 'URL',
    'props.httpMethod': 'Method',
    'props.httpBody': 'Request body (JSON)',
    'props.httpSaveTo': 'Save response to field',

    // Quick presets
    'preset.userName': 'Name',
    'preset.email': 'Email',
    'preset.phone': 'Phone',
    'preset.date': 'Date',
    'preset.num1': 'num1',
    'preset.num2': 'num2',
    'preset.rand': 'rand',

    // Validation presets

    // Utility buttons

    // Toolbar
    'toolbar.botName': 'Bot name',
    'toolbar.undo': 'Undo (Ctrl+Z)',
    'toolbar.redo': 'Redo (Ctrl+Shift+Z)',
    'toolbar.importJson': 'Import JSON',
    'toolbar.exportJson': 'Export JSON',
    'toolbar.exportPng': 'Export PNG',
    'toolbar.preview': 'Chat Preview',
    'toolbar.validate': 'Validate & Export',
    'toolbar.help': 'Help',
    'toolbar.newProject': 'New Project (Ctrl+N)',
    'toolbar.recentProjects': 'Recent Projects',
    'toolbar.noProjects': 'No other projects yet',
    'toolbar.removeProject': 'Remove from history',
    'toolbar.more': 'All commands',
    'toolbar.platforms': 'Platforms',
    'toolbar.platformsAll': 'All platforms',
    'toolbar.platformsVoice': 'Voice',
    'toolbar.platformsChat': 'Chat bots',

    // Export dialog
    'export.title': 'Validate & Export',
    'export.validation': 'Validation',
    'export.valid': 'Flow is valid. Ready to export.',
    'export.errors': 'error(s) found:',
    'export.demoHint':
        'This is a learning example: the orphan-block errors are intentional, to demo validation. Connect them to the flow or delete them — and the bot is ready to export.',
    'export.unconnected':
        'Not connected to the flow: {blocks}. These blocks will not be generated in the project — the CLI only builds handlers for blocks reached by an edge or a button with a target. Connect them if your bot needs them.',
    'export.warningsTitle': 'How the bot will behave',
    'export.copyJson': 'Copy JSON',
    'export.download': 'Download flow.json',
    'export.copied': 'Copied to clipboard',
    'toast.exported': 'flow.json downloaded. The project is also auto-saved in your browser.',
    'export.nodes': 'blocks',

    // Status bar
    'statusbar.ok': 'Ready to export',
    'statusbar.errors': 'errors',
    'statusbar.more': 'more',
    'export.edges': 'connections',
    'export.platforms': 'platforms',
    'export.nextSteps': 'What to do next?',
    'export.readyTitle': 'JSON is ready! How to run the bot:',
    'export.step1': 'Install Node.js (version 22 or later)',
    'export.step2': 'Download flow.json and open a terminal in the folder with the file',
    'export.step3': 'Run this command:',
    'export.copyCommand': 'Copy command',
    'export.commandCopied': 'Command copied!',
    'export.afterCommand':
        'Next, open the my-bot folder: put the platform tokens into the .env file and follow README.md (install, run, connect platforms).',
    'export.tip':
        'Not sure what to do with the code? Send the my-bot folder to a developer — they will run the bot for you.',
    'export.jsonFormatHint':
        'Learn more about blocks and the format in the Help guide (the "Help" button in the toolbar).',
    'export.cloudTitle': 'For Yandex Cloud Functions:',
    'export.cloudDesc':
        'Yandex Cloud is a serverless platform by Yandex. Documentation: cloud.yandex.ru/docs/functions',

    // Preview
    'preview.title': 'Chat Preview',
    'preview.placeholder': 'Type a message...',
    'preview.send': 'Send',
    'preview.empty': 'Type a message to test your bot',
    'preview.debug': 'Debug mode',
    'preview.reset': 'Reset preview (clear messages and variables)',
    'preview.debugVars': 'User data',
    'preview.waiting': 'Waiting for input',

    // General

    // Errors
    'error.parseFailed': 'Failed to process JSON file',
    'error.exportFailed': 'Failed to export PNG',
    'error.crashTitle': 'Something went wrong',
    'error.crashDesc':
        'An unexpected error occurred in the editor. Your project is saved in the browser — reload the page to continue.',
    'error.reload': 'Reload page',

    // Help modal
    'help.title': 'User Guide',
    'help.whatIs': 'What is this?',
    'help.whatIsDesc':
        'Umbot Flow is a visual editor for creating bots based on the umbot framework. You create a bot by placing blocks on a canvas and connecting them. Then export a configuration and automatically generate a ready project with code.',
    'help.howToStart': 'How to start?',
    'help.howToStartDesc':
        '1. Drag a "Command" block to the canvas\n2. Click it and fill in the trigger words (slots) and response text\n3. Add more blocks and connect them\n4. Click "Validate & Export" to download flow.json\n5. Run: npx umbot create from-flow flow.json --output ./my-bot',
    'help.howItWorks': 'How it works?',
    'help.howItWorksDesc':
        'The editor creates a configuration → a special program generates a ready project with code.',
    'help.flowEditor': 'Editor',
    'help.flowJson': 'JSON',
    'help.flowCli': 'Program',
    'help.flowTs': 'TS project',
    'help.nodeTypes': 'Block Types',
    'help.cmdDesc':
        'Triggers on specific words. User types a word \u2192 bot replies with the configured text and buttons.',
    'help.stepDesc':
        'Waits for the user\'s reply, saves it to a field and continues the dialog. The question is asked by the block BEFORE the step (a command or response); the step text is the reaction to the reply. Example: Response "What is your name?" → Step (save to userName) → Response "Hi, {{userName}}!".',
    'help.condDesc':
        'Checks a variable value and branches the dialog. Example: if age >= 18, go one way, otherwise another.',
    'help.endDesc':
        'Ends the dialog. The bot stops responding until the user starts a new conversation.',
    'help.actionDesc':
        'Performs actions: set variables, generate random numbers, make HTTP requests. Shows text after execution.',
    'help.responseDesc':
        'Shows text to the user. Use for reusing the same message from multiple places, or as a simple response block.',
    'help.slotsTitle': 'What are slots?',
    'help.slotsDesc':
        'Slots are trigger words. When the user types one of them, the bot activates this command.\n\n\u2022 Type a word and press Enter to add\n\u2022 The bot matches case-insensitively (hello = Hello = HELLO)\n\u2022 You can use regular expressions in Pattern mode',
    'help.userDataTitle': 'How to save user data?',
    'help.userDataDesc':
        'Use a "Step" block with the "Save to field" setting.\n\nExample: create a Step block, set "Save to" = "userName", and the user\'s response will be saved in the "userName" field. You can then reference it in other blocks using {{userName}}.',
    'help.exportTitle': 'Export project',
    'help.exportDesc':
        'Click "Validate & Export" to download flow.json. Then run:\n\nnpx umbot create from-flow flow.json --output ./my-bot\n\nThis generates a complete umbot project with all the code you need.',
    'help.customTitle': 'Custom code',
    'help.customDesc':
        'Use "Action" blocks for HTTP requests and custom logic. Actions run in a safe mode — you can access user data and use built-in utilities, but cannot access the filesystem or network directly.',
    'help.sysVarsTitle': 'System variables',
    'help.sysVarsDesc':
        'These variables are filled in automatically by the bot — no need to create them:\n\n• {{__currentTime}} — current time\n• {{__currentDate}} — current date\n• {{__currentTimestamp}} — Unix time in milliseconds\n• {{__randomNumber}} — random number from 0 to 100\n• {{__userName}} — user name (if provided by the platform)',
    'help.shortcutsTitle': 'Keyboard shortcuts',
    'help.shortcutSearch': 'Search blocks',
    'help.shortcutNew': 'New project',
    'help.shortcutExport': 'Export JSON',
    'help.shortcutPreview': 'Chat preview',
    'help.shortcutUndo': 'Undo',
    'help.shortcutRedo': 'Redo',
    'help.shortcutCopy': 'Copy block',
    'help.shortcutPaste': 'Paste block',
    'help.shortcutDuplicate': 'Duplicate block',
    'help.shortcutDelete': 'Delete block or connection',
    'help.close': 'Close',
    'help.docsLink': 'Full documentation',

    // Node badges
    'node.badge.cmd': 'COMMAND',
    'node.badge.welcome': 'START',
    'node.badge.help': 'HELP',
    'node.badge.fallback': 'DEFAULT',
    'node.badge.step': 'STEP',
    'node.badge.if': 'IF',
    'node.badge.end': 'END',
    'node.badge.action': 'ACTION',
    'node.badge.response': 'RESPONSE',
    'node.preview.noResponse': '(no response)',
    'node.preview.noSlots': '(no slots)',
    'node.preview.noPrompt': '(waits for reply)',
    'node.preview.patternMode': 'Pattern mode',

    // Action node
    'action.set_variable': 'Set variable',
    'action.random_number': 'Random number',
    'action.http_request': 'HTTP request',
    'action.field': 'Field name',
    'action.value': 'Value',
    'action.valueHelp': 'Expressions: num1 + num2, field * 2, etc.',
    'action.saveResponseTo': 'Save response to field',

    // UserData panel
    'userData.title': 'User Data',
    'userData.empty': 'No data saved yet',
    'userData.comment': 'Comment',
    'userData.commentPlaceholder': 'Variable description',
    'userData.definedIn': 'Defined in:',
    'userData.usedIn': 'Used in:',
    'userData.notFound': 'Not found in blocks',
    'variable.insertVar': 'Insert variable',
    'variable.system': 'System',
    'variable.currentTime': 'Current time (HH:MM)',
    'variable.currentDate': 'Current date (DD.MM.YYYY)',
    'variable.currentTimestamp': 'Unix timestamp',
    'variable.randomNumber': 'Random number (0-100)',
    'variable.userName': 'User name',
    'variable.thisBlock': 'Variables from this block',
    'variable.global': 'Global variables',

    // Command palette
    'palette.placeholder': 'Search blocks… (Ctrl+K)',
    'palette.noResults': 'No results',
    'palette.navHint': '↑↓ navigate',
    'palette.selectHint': 'Enter to select',
    'palette.closeHint': 'Esc to close',
    'props.cardHelp':
        'A visual block with images. Shown instead of text or alongside it.\n\nTypes:\n• Single image — one picture\n• List — images top to bottom\n• Gallery — images horizontally',
    'props.addCard': 'Add card',
    'props.removeCard': 'Remove card',
    'props.cardTitle': 'Card title',
    'props.addImage': 'Add image',
    'props.imageTitle': 'Image title',
    'props.imageDesc': 'Description',
    'card.single': 'Single image',
    'card.list': 'List',
    'card.gallery': 'Gallery',
    'props.actions': 'Additional actions',
    'props.conditions': 'Conditions (logic branching)',
    'props.addCondition': 'Add condition',
    'props.condition': 'Condition',

    // Database settings
    'db.texts': 'Bot texts',
    'db.welcome': 'Welcome text',
    'db.fallback': 'Fallback text',
    'db.helpText': 'Help text',
    'db.type': 'Database type',
    'db.typeFile': 'File',
    'db.typeMongo': 'MongoDB',
    'db.typeNone': 'None',
    'db.mode': 'Bot mode',
    'db.localStorage': 'Local storage',
    'db.localStorageDesc': 'Save user data in localStorage',
    'db.tokens': 'Platform tokens',
    'db.tokensEmpty': 'Select platforms in the header first',
    'db.tokenPlaceholder': 'Paste token...',
    'db.tokensHint':
        'Tokens go into the .env file of the generated project. You can leave the fields empty and put the tokens into .env after generation — then they never end up in the JSON. Do not publish JSON with tokens!',

    // Validation messages
    'validation.emptyName': 'Block name cannot be empty',
    'validation.invalidVarName': 'Invalid variable name (use letters, numbers, _)',
    'validation.duplicateName': 'Name is already used by another block',

    // Operator labels
    'operator.eq': '=',
    'operator.neq': '≠',
    'operator.gt': '>',
    'operator.gte': '≥',
    'operator.lt': '<',
    'operator.lte': '≤',
    'operator.contains': 'contains',
    'operator.isEmpty': 'is empty',
    'operator.isNotEmpty': 'is not empty',
    'operator.isSayTrue': 'user agreed',
    'operator.isSayFalse': 'user disagreed',
    'operator.isUrl': 'is URL',

    // Node labels
    'node.noActions': '(no actions)',
    'node.saveTo': 'Save to:',
    'node.hasErrors': 'Validation errors present. Click to open this block.',

    // Condition labels
    'condition.true': 'Yes',
    'condition.false': 'No',
    'condition.trueText': 'Text if yes',
    'condition.falseText': 'Text if no',

    // Condition presets
    'condition.preset.isEmpty': 'Field is empty',
    'condition.preset.isNotEmpty': 'Field is filled',
    'condition.preset.isYes': 'User said "yes"',
    'condition.preset.isNo': 'User said "no"',
    'condition.preset.isUrl': 'User sent a URL',
    'condition.preset.numberGt10': 'Number greater than 10',
    'condition.preset.numberLt100': 'Number less than 100',

    // Action placeholders
    'action.min': 'Min',
    'action.max': 'Max',
    'action.imageUrl': 'Image URL',

    // User data tooltips

    // System variables
    'system.userName': 'User',

    // Toolbar tooltips
    'toolbar.localeRu': 'Switch to Russian',
    'toolbar.localeEn': 'Switch to English',
    'toolbar.themeLight': 'Switch to light theme',
    'toolbar.themeDark': 'Switch to dark theme',
    'toolbar.hideMinimap': 'Hide minimap',
    'toolbar.showMinimap': 'Show minimap',
    'props.floatingMode': 'Floating mode',
    'props.dockedMode': 'Dock to right',
    'props.expand': 'Expand',
    'props.collapse': 'Collapse',
    'props.presets': 'Presets',
    'props.cardSection': 'Card',
    'props.onTap': 'On tap',
    'db.welcomePlaceholder': 'Hello! I am a bot.',
    'db.fallbackPlaceholder': "Sorry, I didn't understand.",
    'db.helpTextPlaceholder': 'I am a helper bot.',
    'toolbar.botSettings': 'Bot settings',
    'platform.alisa': 'Alisa',
    'platform.telegram': 'Telegram',
    'platform.vk': 'VK',
    'platform.marusia': 'Marusia',
    'platform.max': 'Max',
    'platform.viber': 'Viber',
    'platform.smartApp': 'SmartApp',

    // Context menu
    'contextMenu.command': 'Command',
    'contextMenu.step': 'Step',
    'contextMenu.response': 'Response',
    'contextMenu.action': 'Action',
    'contextMenu.condition': 'Condition',
    'contextMenu.end': 'End',
    'contextMenu.duplicate': 'Duplicate',
    'contextMenu.previewFrom': 'Run preview from here',
    'contextMenu.delete': 'Delete',

    // Canvas
    'canvas.edgeDelete': 'Delete connection (or press Delete)',
    'canvas.dropHere': 'Release to add block',

    // Emotion labels
    'props.emotion.good': 'Happy',
    'props.emotion.neutral': 'Neutral',
    'props.emotion.bad': 'Sad',

    // Status bar extras
    'statusbar.saved': 'Saved',
    'statusbar.saving': 'Saving…',
    'statusbar.saveError':
        'Could not save: browser storage is full. Export the project to a JSON file so you do not lose your work.',
    'statusbar.saveErrorShort': 'Not saved!',
    'statusbar.clickToExport': 'Validate & export',
    'projects.openConfirm':
        'Open project "{name}"? The current project stays in recent list, but your current editing session will be replaced.',

    // Export extras
    'export.note':
        'This file contains your entire bot. It runs on your own server via umbot and does not depend on this website.',

    // Preview extras
    'preview.waitingPlaceholder': 'Your reply (saved to "{var}")…',
    'preview.httpMock': '[simulated HTTP {method} → {url}]',
    'preview.httpMockData': 'test HTTP response',
    'preview.emptyReply': '(the bot sent nothing)',
    'preview.defaultFallback': "Sorry, I didn't understand.",
    'preview.blockLimit':
        '[preview stopped: too many blocks ran in one turn — make sure user choices go through a Step]',
    'preview.varsTitle': 'Variables',
    'preview.warning':
        'Preview is a simulation: HTTP requests and voice playback are not executed.',

    // Errors
    'error.importTitle': 'Import error',
    'error.parseFailedDetail': 'Failed to parse JSON file. Details: {details}',
    'error.validationFailed':
        'The file failed validation. Fix the errors in the JSON and try again:',

    // Condition labels
    'condition.ifLabel': 'If',
    'condition.userInput': 'last user input',

    // Validation (validator *
    'validation.v.unknownType':
        'Unknown block type "{type}". Valid types: command, step, condition, action, response, end',
    'validation.v.requiredField': 'required field',
    'validation.and': 'and',
    'validation.v.badType': 'Block #{idx}: invalid type "{type}"',
    'validation.v.badTypeNoName': 'Block #{idx}: invalid type',
    'validation.v.unknownOperator': 'Unknown operator in a condition',
    'validation.v.badValue': 'Invalid value in field "{field}"',
    'validation.v.required': 'Required field "{field}" is missing',
    'validation.v.mustBeString': 'Expected text in field "{field}"',
    'validation.v.mustBeArray': 'Expected a list in field "{field}"',
    'validation.v.mustBeObject': 'Expected an object in field "{field}"',
    'validation.v.invalidJson':
        'The block does not match any known type. Please check its "type" field',
    'validation.v.duplicateId': 'Duplicate node ID "{id}"',
    'validation.v.emptyNodeName':
        'Block has no name (ID: {id}). Fill in the "Name" field on the right.',
    'validation.v.duplicateNames':
        'Block name "{name}" is used twice: by blocks "{a}" and "{b}". Names must be unique.',
    'validation.v.dupSanitizedNames':
        'Block names "{name}" and "{other}" become identical in generated code ("{target}"). Rename one of them: spaces and special characters turn into "_" in code.',
    'validation.v.invalidVarName':
        'Variable name "{name}" is invalid. Use letters, digits, and underscore (do not start with a digit).',
    'validation.v.emptyVarName':
        'Block "{name}": variable name is empty. Fill in the field or remove it.',
    'validation.v.actionVarEmpty':
        'Action in block "{name}": variable name is empty. Fill it in or delete the action.',
    'validation.v.randomNoField':
        'Block "{name}": the "Random number" action has no variable name. Fill in the "Field".',
    'validation.v.randomMinGtMax':
        'Block "{name}": in "Random number", min ({min}) is greater than max ({max}). Please swap them.',
    'validation.v.setNoField':
        'Block "{name}": the "Set variable" action has no variable name. Fill in the "Field".',
    'validation.v.setNoValue':
        'Block "{name}": the "Set variable" action has no value. Enter an expression.',
    'validation.v.httpNoUrl': 'Block "{name}": HTTP request has no URL. Specify one.',
    'validation.v.httpBadJson':
        'Block "{name}": the HTTP body is not valid JSON and contains no {{variables}}. Check the syntax.',
    'validation.v.dupSlot':
        'Trigger word "{slot}" is used by both blocks "{a}" and "{b}". Triggers must be unique.',
    'validation.v.condNoVar':
        'Block "{name}": condition #{idx} has no variable. Choose one or delete the condition.',
    'validation.v.condNoVal':
        'Block "{name}": condition #{idx} has no comparison value. Enter one or delete the condition.',
    'validation.v.edgeFromMissing': 'Connection from a non-existent block "{id}".',
    'validation.v.edgeToMissing': 'Connection to a non-existent block "{id}".',
    'validation.v.buttonTargetMissing': 'A button points to a non-existent block "{id}".',
    'validation.v.stepTargetMissing': 'Step points to a non-existent block "{id}".',
    'validation.v.stepNoNext':
        'Step "{name}" is not connected to anything and has no "Next block" set.',
    'validation.v.condMissingBranches':
        'Condition "{name}": missing branches {missing}. Connect both "Yes" and "No" outputs to blocks.',
    'validation.v.condMissingVar':
        'Condition "{name}": no variable selected. Open the block and choose a variable.',
    'validation.v.condMissingVal':
        'Condition "{name}": no comparison value. Enter a value or delete the condition.',
    'validation.v.orphan':
        'Block "{name}" is not connected to any other block. Connect it or delete it.',
    'validation.v.blockCycle':
        'Cycle without a step: {path}. Responses, actions and conditions run immediately without waiting for the user, so this cycle never stops (the CLI will refuse to generate the bot). Break the cycle with a Step.',
    'validation.w.multipleNext':
        '"{name}" has {count} outgoing links. The bot runs all of them at once, in a single message. To let the user choose, put a Step after the block and branch with Conditions.',
    'validation.w.buttonsWithoutText':
        '"{name}" has buttons but no reply text: Telegram will not send such a message (the buttons are lost), Alice gets an empty reply. Add some text.',
    'validation.w.commandTextHidden':
        'The text of command "{name}" will not be sent: the linked block "{block}" sets its own text (this is how the CLI generates it). Move the text into "{block}".',

    // Variables modal
    'vars.comment': 'Comment',
    'vars.commentPlaceholder': 'What this variable is for',
    'vars.definedIn': 'Defined in:',
    'vars.usedIn': 'Used in:',
    'vars.notFound': 'Not found in blocks',

    // Settings helps
    'settings.title': 'Bot settings',
    'settings.dbTypeHelp':
        'Where the bot stores user data between sessions.\n\n• File — simplest option, saved next to the bot. Good to start.\n• MongoDB — external database. Needed for many users. Requires MongoDB installed.\n• None — data is not saved between restarts.',
    'settings.modeHelp':
        'dev — development mode with verbose logs.\nprod — production mode.\nstrict_prod — like prod, but unsafe regular expressions (ReDoS risk) in slots are rejected instead of only logged. Recommended for production.\nThe mode goes into the generated project (bot.setAppMode).',
    'settings.localStorageHelp':
        'Save user answers to local storage. When off — variables are lost between runs.',
    'settings.goToNode': 'Go to {name}',
    'settings.mode.dev': 'Development (dev)',
    'settings.mode.prod': 'Production (prod)',
    'settings.mode.strict_prod': 'Strict production (strict_prod)',

    // Condition node / props
    'condition.preview': 'Condition',
    'condition.compareWith': 'Compare with:',
    'condition.thisAnswer': 'last user input',

    // Node system
    'node.endAutoName': 'End {n}',
    'node.copySuffix': 'copy',

    // Deep detail
    'detail.botName': 'Bot name',
    'detail.botNameHelp':
        'Used as the file name (BotName.json) and in the generation command. Prefer ASCII, no spaces.',

    // Misc UI
    'ui.done': 'Done',
    'ui.up': 'Up',
    'ui.down': 'Down',
    'confirm.cancel': 'Cancel',
    'confirm.ok': 'Confirm',
    'toolbar.newProjectConfirm':
        'Create a new project? The current flow will be replaced (it stays in the recent list).',
    'projects.openTitle': 'Open project',
    'error.exportTitle': 'Export failed',
} as const;
