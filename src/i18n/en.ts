export default {
    // Sidebar
    'sidebar.nodes': 'BLOCKS',
    'sidebar.command.label': 'Command',
    'sidebar.command.desc': 'Response to trigger words',
    'sidebar.welcome.label': 'Start',
    'sidebar.welcome.desc': 'Bot greeting on launch',
    'sidebar.help.label': 'Help',
    'sidebar.help.desc': 'Response to help command',
    'help.welcomeDesc':
        'The "Start" block defines the greeting message sent when a user first interacts with the bot. Text is taken from bot settings.',
    'help.helpNodeDesc':
        'The "Help" block defines the response to the help command. Text is taken from bot settings.',
    'sidebar.step.label': 'Step',
    'sidebar.step.desc': 'Ask input \u2192 save to field',
    'sidebar.condition.label': 'Condition',
    'sidebar.condition.desc': 'Branch by variable',
    'sidebar.end.label': 'End',
    'sidebar.end.desc': 'Terminate dialog',
    'sidebar.custom.label': 'Action',
    'sidebar.custom.desc': 'Perform action / HTTP request',
    'sidebar.response.label': 'Response',
    'sidebar.response.desc': 'Show text with variables, no input needed',
    'sidebar.howToUse': 'How to use',
    'sidebar.added': 'Added',
    'sidebar.tip1': 'Drag a block to the canvas',
    'sidebar.tip2': 'Click a block to edit properties',
    'sidebar.tip3': 'Connect blocks by dragging handles',
    'sidebar.tip4': 'Press Delete to remove a block',

    // Properties panel
    'props.name': 'Name',
    'props.slots': 'Slot triggers',
    'slots.tooltip':
        'Words that trigger this command. Type and press Enter to add. The bot matches user input case-insensitively.',
    'props.slots.placeholder': 'Type a word and press Enter',
    'props.patternMode': 'Pattern mode',
    'props.patternHelp': 'Words are recognized as regular expressions',
    'props.responseText': 'Response text',
    'props.responseTextHelp': 'Use {{variable}} to substitute user data',
    'props.tts': 'Text-to-speech (TTS)',
    'props.ttsHelp':
        'Text for voice platforms (Alisa, Marusia). If empty, the response text is used.',
    'props.ttsPlaceholder': 'Optional voice text',
    'props.patternWarning': 'Regular expressions are advanced. Use at your own risk.',
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
    'props.promptText': 'Question text',
    'props.promptHelp': 'What to ask the user',
    'props.varComment': 'Variable comment',
    'props.varCommentHelp': 'Description of the variable purpose (visible in data panel)',
    'props.nextStep': 'Next step (ID)',
    'props.nextStepHelp': 'Name of the next block (leave empty to end)',
    'props.operator': 'Operator',
    'props.variable': 'Variable',
    'props.variableHelp': 'Variable name to check',
    'props.comparisonValue': 'Comparison value',
    'tooltip.operator':
        'How to compare:\nEquals (=)\nNot equals (≠)\nGreater than (>)\nGreater than or equal (≥)\nLess than (<)\nLess than or equal (≤)\nContains\nEmpty / Not empty\nUser said "yes" / "no"\nIs a URL',
    'tooltip.variable': 'Name of the variable to check',
    'tooltip.comparisonValue':
        'Value to compare the variable against. Can be a number, text, or another variable name',
    'tooltip.field': 'Name of the field to store the result',
    'tooltip.responseText': 'Text the user will see. Use {{name}} to insert variables',
    'props.delete': 'Delete',
    'props.deleteConfirm': 'Delete this block? All connected edges will also be removed.',
    'props.namePlaceholder': 'e.g. greeting',
    'props.fieldPlaceholder': 'e.g. userName',
    'props.httpUrl': 'URL',
    'props.httpMethod': 'Method',
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
    'toolbar.platforms': 'Platforms',
    'toolbar.platformsAll': 'All platforms',
    'toolbar.platformsVoice': 'Voice',
    'toolbar.platformsChat': 'Chat bots',

    // Export dialog
    'export.title': 'Validate & Export',
    'export.validation': 'Validation',
    'export.valid': 'Flow is valid. Ready to export.',
    'export.errors': 'error(s) found:',
    'export.copyJson': 'Copy JSON',
    'export.download': 'Download flow.json',
    'export.copied': 'Copied to clipboard',
    'export.nodes': 'blocks',
    'export.edges': 'connections',
    'export.platforms': 'platforms',
    'export.nextSteps': 'What to do next?',
    'export.readyTitle': 'JSON is ready! How to run the bot:',
    'export.step1': 'Install Node.js (version 18 or later)',
    'export.step2': 'Download flow.json and open a terminal in the folder with the file',
    'export.step3': 'Run this command:',
    'export.copyCommand': 'Copy command',
    'export.commandCopied': 'Command copied!',
    'export.afterCommand':
        'To verify, open the my-bot folder and follow the instructions in README.',
    'export.tip':
        'Not sure what to do with the code? Send the my-bot folder to a developer — they will run the bot for you.',
    'export.jsonFormatHint': 'More about JSON format:',
    'export.cloudTitle': 'For Yandex Cloud Functions:',
    'export.cloudDesc':
        'Yandex Cloud is a serverless platform by Yandex. Documentation: cloud.yandex.ru/docs/functions',

    // Preview
    'preview.title': 'Chat Preview',
    'preview.placeholder': 'Type a message...',
    'preview.send': 'Send',
    'preview.empty': 'Type a message to test your bot',
    'preview.debug': 'Debug mode',
    'preview.debugVars': 'User data',
    'preview.waiting': 'Waiting for input',

    // General

    // Errors
    'error.parseFailed': 'Failed to parse JSON file',
    'error.exportFailed': 'Failed to export PNG',

    // Help modal
    'help.title': 'User Guide',
    'help.whatIs': 'What is this?',
    'help.whatIsDesc':
        'Umbot Flow Editor is a visual editor for creating bots based on the umbot framework. You create a bot by placing blocks on a canvas and connecting them. Then export a configuration and automatically generate a ready project with code.',
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
        'Asks the user for input and saves it to a field. Example: ask for name, save to "Name" field.',
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
        'Use "Action" blocks for HTTP requests and custom logic. Actions run in a safe mode \u2014 you can access user data and use built-in utilities, but cannot access the filesystem or network directly.',
    'help.close': 'Got it',

    // Node badges
    'node.badge.cmd': 'COMMAND',
    'node.badge.welcome': 'START',
    'node.badge.help': 'HELP',
    'node.badge.step': 'STEP',
    'node.badge.if': 'IF',
    'node.badge.end': 'END',
    'node.badge.action': 'ACTION',
    'node.badge.response': 'RESPONSE',
    'node.preview.noResponse': '(no response)',
    'node.preview.noSlots': '(no slots)',
    'node.preview.noPrompt': '(no prompt)',
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
    'variable.insertVar': 'Insert variable',
    'variable.system': 'System',
    'variable.currentTime': 'Current time (HH:MM)',
    'variable.currentDate': 'Current date (DD.MM.YYYY)',
    'variable.currentTimestamp': 'Unix timestamp',
    'variable.randomNumber': 'Random number (0-100)',
    'variable.userName': 'User name',
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
    'db.title': 'DATABASE & MODE',
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
        'Tokens are used when generating the settings file. Do not publish JSON with tokens!',

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

    // Canvas
    'canvas.edgeDelete': 'Delete connection (or press Delete)',

    // Chat preview

    // Save indicator

    // Emotion labels
    'props.emotion.good': 'Good',
    'props.emotion.neutral': 'Neutral',
    'props.emotion.bad': 'Bad',
} as const;
