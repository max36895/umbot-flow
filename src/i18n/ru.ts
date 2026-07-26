export default {
    // Sidebar
    'sidebar.nodes': 'БЛОКИ',
    'sidebar.command.label': 'Команда',
    'sidebar.command.desc': 'Реакция на слова-триггеры',
    'sidebar.welcome.label': 'Старт',
    'sidebar.welcome.desc': 'Приветствие при запуске бота',
    'sidebar.help.label': 'Помощь',
    'sidebar.help.desc': 'Ответ на команду помощи',
    'help.welcomeDesc':
        'Блок "Старт" определяет приветственное сообщение, которое бот отправляет при первом обращении пользователя. Текст берётся из настроек бота.',
    'help.helpNodeDesc':
        'Блок "Помощь" определяет ответ на команду помощи. Текст берётся из настроек бота.',
    'sidebar.step.label': 'Шаг',
    'sidebar.step.desc': 'Запрос ввода \u2192 сохранение в поле',
    'sidebar.condition.label': 'Условие',
    'sidebar.condition.desc': 'Ветвление по переменной',
    'sidebar.end.label': 'Завершение',
    'sidebar.end.desc': 'Завершить диалог',
    'sidebar.custom.label': 'Действие',
    'sidebar.custom.desc': 'Выполнить действие / HTTP-запрос',
    'sidebar.response.label': 'Ответ',
    'sidebar.response.desc': 'Показать текст с переменными, без ввода',
    'sidebar.howToUse': 'Как пользоваться',
    'sidebar.added': 'Добавлен',
    'sidebar.tip1': 'Перетащите блок на холст',
    'sidebar.tip2': 'Нажмите на блок для редактирования',
    'sidebar.tip3': 'Соединяйте блоки перетаскиванием',
    'sidebar.tip4': 'Нажмите Delete для удаления',

    // Properties panel
    'props.name': 'Название',
    'props.slots': 'Слова-триггеры',
    'slots.tooltip':
        'Слова, при вводе которых бот реагирует на эту команду.\n\nКак использовать:\n• Введите слово и нажмите Enter\n• Бот распознаёт без учёта регистра (привет = Привет = ПРИВЕТ)\n• Можно добавить несколько слов',
    'props.slots.placeholder': 'Введите слово и нажмите Enter',
    'props.patternMode': 'Режим шаблона',
    'props.patternHelp':
        'Позволяет использовать сложные правила распознавания (регулярные выражения). Для начинающих — лучше оставить выключенным.',
    'props.responseText': 'Текст ответа',
    'props.responseTextHelp':
        'Что бот ответит пользователю. Можно вставлять переменные: напишите {{имя}} и подставится значение.',
    'props.tts': 'Текст для озвучки',
    'props.ttsHelp':
        'Текст, который бот скажет вслух на голосовых платформах (Алиса, Маруся). Если оставить пустым, будет озвучен основной текст ответа.',
    'props.ttsPlaceholder': 'Необязательно',
    'props.patternWarning':
        'Регулярные выражения — это способ задать сложное правило распознавания. Если вы не уверены, лучше не включать.',
    'props.emotion': 'Эмоция',
    'props.emotion.good': 'Хорошая',
    'props.emotion.neutral': 'Нейтральная',
    'props.emotion.bad': 'Плохая',
    'props.endDialog': 'Завершить диалог',
    'props.endDialogHelp':
        'После этого ответа бот перестанет отвечать, пока пользователь не начнёт новый разговор.',
    'props.shuffleButtons': 'Случайный порядок кнопок',
    'props.shuffleButtonsHelp':
        'Перемешать кнопки перед показом. Полезно для викторин и математических игр.',
    'props.advancedSettings': 'Расширенные настройки',
    'props.advancedHide': 'Скрыть расширенные',
    'props.buttons': 'Кнопки',
    'props.buttonsHelp':
        'Кнопки под текстом ответа. Пользователь нажимает — и бот реагирует.\n\nТипы кнопок:\n• Переход — открывает другой блок\n• Ссылка — открывает ссылку в браузере',
    'props.addButton': 'Добавить кнопку',
    'props.buttonTitle': 'Текст кнопки',
    'props.buttonAction': 'Переход',
    'props.buttonLink': 'Ссылка',
    'props.url': 'Адрес ссылки',
    'props.promptText': 'Текст вопроса',
    'props.promptHelp': 'Вопрос или сообщение, которое бот отправит пользователю.',
    'props.varComment': 'Комментарий к переменной',
    'props.varCommentHelp': 'Описание назначения переменной (видно в панели данных)',
    'props.nextStep': 'Следующий шаг (ID)',
    'props.nextStepHelp': 'Название следующего блока (оставьте пустым для завершения)',
    'props.operator': 'Оператор',
    'props.variable': 'Проверяемая переменная',
    'props.variableHelp': 'Имя переменной для проверки.',
    'props.comparisonValue': 'Сравниваем с',
    'tooltip.operator':
        'Как сравнивать:\nРавно (=)\nНе равно (≠)\nБольше (>)\nБольше или равно (≥)\nМеньше (<)\nМеньше или равно (≤)\nСодержит\nПусто / Не пусто\nПользователь сказал «да» / «нет»\nЭто ссылка',
    'tooltip.variable': 'Имя переменной, значение которой проверяется.',
    'tooltip.comparisonValue':
        'Значение для сравнения. Можно указать:\n• Число: 18, 100\n• Текст: привет\n• Имя другой переменной: age',
    'tooltip.field': 'Имя переменной, куда сохранится результат.',
    'tooltip.responseText':
        'Текст, который увидит пользователь.\nВставляйте переменные через {{имя}}.',
    'props.delete': 'Удалить',
    'props.deleteConfirm': 'Удалить этот блок? Все связанные связи также будут удалены.',
    'props.namePlaceholder': 'напр. приветствие',
    'props.fieldPlaceholder': 'напр. имя_пользователя',
    'props.httpUrl': 'URL',
    'props.httpMethod': 'Метод',
    'props.httpBody': 'Тело запроса (JSON)',
    'props.httpSaveTo': 'Сохранить ответ в поле',

    // Quick presets
    'preset.userName': 'Имя',
    'preset.email': 'Email',
    'preset.phone': 'Телефон',
    'preset.date': 'Дата',
    'preset.num1': 'num1',
    'preset.num2': 'num2',
    'preset.rand': 'rand',

    // Validation presets

    // Utility buttons

    // Toolbar
    'toolbar.botName': 'Имя бота',
    'toolbar.undo': 'Отменить (Ctrl+Z)',
    'toolbar.redo': 'Повторить (Ctrl+Shift+Z)',
    'toolbar.importJson': 'Импорт JSON',
    'toolbar.exportJson': 'Экспорт JSON',
    'toolbar.exportPng': 'Экспорт PNG',
    'toolbar.preview': 'Предпросмотр чата',
    'toolbar.validate': 'Проверить и экспортировать',
    'toolbar.help': 'Справка',
    'toolbar.newProject': 'Новый проект (Ctrl+N)',
    'toolbar.platforms': 'Платформы',
    'toolbar.platformsAll': 'Все платформы',
    'toolbar.platformsVoice': 'Голосовые',
    'toolbar.platformsChat': 'Чат-боты',

    // Export dialog
    'export.title': 'Проверка и экспорт',
    'export.validation': 'Проверка',
    'export.valid': 'Флоу валиден. Готов к экспорту.',
    'export.errors': 'найдено ошибок:',
    'export.copyJson': 'Копировать JSON',
    'export.download': 'Скачать flow.json',
    'export.copied': 'Скопировано в буфер обмена',
    'export.nodes': 'узлов',
    'export.edges': 'связей',
    'export.platforms': 'платформ',
    'export.nextSteps': 'Что делать дальше?',
    'export.readyTitle': 'JSON готов! Как запустить бота:',
    'export.step1': 'Установите Node.js (версия 18 или выше)',
    'export.step2': 'Скачайте flow.json и откройте терминал в папке с файлом',
    'export.step3': 'Выполните команду:',
    'export.copyCommand': 'Копировать команду',
    'export.commandCopied': 'Команда скопирована!',
    'export.afterCommand': 'Для проверки откройте папку my-bot и следуйте инструкциям в README.',
    'export.tip':
        'Не знаете что делать с кодом? Отправьте папку my-bot разработчику — он запустит бота за вас.',
    'export.jsonFormatHint': 'Подробнее о JSON-формате:',
    'export.cloudTitle': 'Для Yandex Cloud Functions:',
    'export.cloudDesc':
        'Yandex Cloud — облачная платформа Яндекса для серверless-приложений. Документация: cloud.yandex.ru/docs/functions',

    // Preview
    'preview.title': 'Предпросмотр чата',
    'preview.placeholder': 'Введите сообщение...',
    'preview.send': 'Отправить',
    'preview.empty': 'Введите сообщение для тестирования бота',
    'preview.debug': 'Режим отладки',
    'preview.debugVars': 'Данные пользователя',
    'preview.waiting': 'Ожидание ввода',

    // General

    // Errors
    'error.parseFailed': 'Не удалось распарсить JSON файл',
    'error.exportFailed': 'Не удалось экспортировать PNG',

    // Help modal
    'help.title': 'Руководство пользователя',
    'help.whatIs': 'Что это?',
    'help.whatIsDesc':
        'Umbot Flow Editor — визуальный редактор для создания ботов на базе фреймворка umbot. Вы создаёте бота, расставляя блоки на холсте и соединяя их. Затем экспортируете конфигурацию и автоматически генерируете готовый проект с кодом.',
    'help.howToStart': 'Как начать?',
    'help.howToStartDesc':
        '1. Перетащите блок "Команда" на холст\n2. Нажмите на него и заполните слова-триггеры и текст ответа\n3. Добавьте другие блоки и соедините их\n4. Нажмите "Проверить и экспортировать" для скачивания flow.json\n5. Запустите: npx umbot create from-flow flow.json --output ./my-bot',
    'help.howItWorks': 'Как это работает?',
    'help.howItWorksDesc':
        'Редактор создаёт конфигурацию → специальная программа генерирует готовый проект с кодом.',
    'help.flowEditor': 'Редактор',
    'help.flowJson': 'JSON',
    'help.flowCli': 'Программа',
    'help.flowTs': 'TS-проект',
    'help.nodeTypes': 'Типы блоков',
    'help.cmdDesc':
        'Реагирует на определённые слова. Пользователь вводит слово \u2192 бот отвечает настроенным текстом и кнопками.',
    'help.stepDesc':
        'Запрашивает ввод у пользователя и сохраняет его в поле. Пример: спросить имя, сохранить в поле "Имя пользователя".',
    'help.condDesc':
        'Проверяет значение переменной и ведёт диалог по разным веткам. Пример: если возраст >= 18, идти одним путём, иначе другим.',
    'help.endDesc':
        'Завершает диалог. Бот перестаёт отвечать, пока пользователь не начнёт новый разговор.',
    'help.actionDesc':
        'Выполняет действия: установка переменных, генерация чисел, HTTP-запросы. Показывает текст после выполнения.',
    'help.responseDesc':
        'Показывает текст пользователю. Используйте для переиспользования сообщений или как простой блок ответа.',
    'help.slotsTitle': 'Что такое слоты?',
    'help.slotsDesc':
        'Слоты \u2014 это слова-триггеры. Когда пользователь вводит одно из них, бот активирует эту команду.\n\n\u2022 Введите слово и нажмите Enter для добавления\n\u2022 Бот распознаёт без учёта регистра (привет = Привет = ПРИВЕТ)\n\u2022 В режиме шаблона можно использовать регулярные выражения',
    'help.userDataTitle': 'Как сохранять данные пользователя?',
    'help.userDataDesc':
        'Используйте блок "Шаг" с настройкой "Сохранить в поле".\n\nПример: создайте блок Шаг, установите "Сохранить в" = "userName", и ответ пользователя сохранится в поле "userName". Затем можно ссылаться на него в других блоках через {{userName}}.',
    'help.exportTitle': 'Экспорт проекта',
    'help.exportDesc':
        'Нажмите "Проверить и экспортировать" для скачивания flow.json. Затем выполните:\n\nnpx umbot create from-flow flow.json --output ./my-bot\n\nЭто сгенерирует готовый проект umbot со всем необходимым кодом.',
    'help.customTitle': 'Свой код',
    'help.customDesc':
        'Используйте блоки "Действие" для HTTP-запросов и кастомной логики. Действия выполняются в безопасном режиме \u2014 можно обращаться к данным пользователя и использовать встроенные утилиты, но нельзя напрямую обращаться к файловой системе или сети.',
    'help.close': 'Понятно',

    // Node badges
    'node.badge.cmd': 'КОМАНДА',
    'node.badge.welcome': 'СТАРТ',
    'node.badge.help': 'ПОМОЩЬ',
    'node.badge.step': 'ШАГ',
    'node.badge.if': 'УСЛОВИЕ',
    'node.badge.end': 'КОНЕЦ',
    'node.badge.action': 'ДЕЙСТВИЕ',
    'node.badge.response': 'ОТВЕТ',
    'node.preview.noResponse': '(нет ответа)',
    'node.preview.noSlots': '(нет триггеров)',
    'node.preview.noPrompt': '(нет вопроса)',
    'node.preview.patternMode': 'Режим шаблона',

    // Action node
    'action.set_variable': 'Установить переменную',
    'action.random_number': 'Случайное число',
    'action.http_request': 'HTTP-запрос',
    'action.field': 'Название поля',
    'action.value': 'Значение',
    'action.valueHelp': 'Выражения: num1 + num2, поле * 2 и т.д.',
    'action.saveResponseTo': 'Сохранить ответ в поле',

    // UserData panel
    'userData.title': 'Данные пользователя',
    'userData.empty': 'Данные ещё не сохранены',
    'variable.insertVar': 'Вставить переменную',
    'variable.system': 'Системные',
    'variable.currentTime': 'Текущее время (ЧЧ:ММ)',
    'variable.currentDate': 'Текущая дата (ДД.ММ.ГГГГ)',
    'variable.currentTimestamp': 'Unix-таймстамп',
    'variable.randomNumber': 'Случайное число (0-100)',
    'variable.userName': 'Имя пользователя',
    'props.cardHelp':
        'Визуальный блок с изображениями. Показывается вместо текста или вместе с ним.\n\nТипы:\n• Одно изображение — одна картинка\n• Список — изображения сверху вниз\n• Галерея — изображения горизонтально',
    'props.addCard': 'Добавить карточку',
    'props.removeCard': 'Убрать карточку',
    'props.cardTitle': 'Заголовок карточки',
    'props.addImage': 'Добавить изображение',
    'props.imageTitle': 'Заголовок изображения',
    'props.imageDesc': 'Описание',
    'card.single': 'Одно изображение',
    'card.list': 'Список',
    'card.gallery': 'Галерея',
    'props.actions': 'Дополнительные действия',
    'props.conditions': 'Условия (ветвление логики)',
    'props.addCondition': 'Добавить условие',
    'props.condition': 'Условие',

    // Database settings
    'db.title': 'НАСТРОЙКИ БД И РЕЖИМА',
    'db.texts': 'Тексты бота',
    'db.welcome': 'Текст приветствия',
    'db.fallback': 'Текст «не понял»',
    'db.helpText': 'Текст справки',
    'db.type': 'Тип базы данных',
    'db.typeFile': 'Файл',
    'db.typeMongo': 'MongoDB',
    'db.typeNone': 'Нет',
    'db.mode': 'Режим бота',
    'db.localStorage': 'Локальное хранение',
    'db.localStorageDesc': 'Сохранять данные пользователя в localStorage',
    'db.tokens': 'Токены платформ',
    'db.tokensEmpty': 'Сначала выберите платформы в шапке',
    'db.tokenPlaceholder': 'Вставьте токен...',
    'db.tokensHint':
        'Токены используются при генерации файла с настройками. Не публикуйте JSON с токенами!',

    // Validation messages
    'validation.emptyName': 'Имя блока не может быть пустым',
    'validation.invalidVarName': 'Некорректное имя переменной (используйте буквы, цифры, _)',
    'validation.duplicateName': 'Имя уже используется другим блоком',

    // Operator labels
    'operator.eq': '=',
    'operator.neq': '≠',
    'operator.gt': '>',
    'operator.gte': '≥',
    'operator.lt': '<',
    'operator.lte': '≤',
    'operator.contains': 'содержит',
    'operator.isEmpty': 'пусто',
    'operator.isNotEmpty': 'не пусто',
    'operator.isSayTrue': 'пользователь согласился',
    'operator.isSayFalse': 'пользователь не согласился',
    'operator.isUrl': 'является ссылкой',

    // Node labels
    'node.noActions': '(нет действий)',
    'node.saveTo': 'Сохранить в:',

    // Condition labels
    'condition.true': 'Да',
    'condition.false': 'Нет',
    'condition.trueText': 'Текст при да',
    'condition.falseText': 'Текст при нет',

    // Condition presets
    'condition.preset.isEmpty': 'Поле пустое',
    'condition.preset.isNotEmpty': 'Поле заполнено',
    'condition.preset.isYes': 'Пользователь сказал "да"',
    'condition.preset.isNo': 'Пользователь сказал "нет"',
    'condition.preset.isUrl': 'Пользователь отправил ссылку',
    'condition.preset.numberGt10': 'Число больше 10',
    'condition.preset.numberLt100': 'Число меньше 100',

    // Action placeholders
    'action.min': 'Мин',
    'action.max': 'Макс',
    'action.imageUrl': 'URL изображения',

    // User data tooltips

    // System variables
    'system.userName': 'Пользователь',

    // Toolbar tooltips
    'toolbar.localeRu': 'Переключить на русский',
    'toolbar.localeEn': 'Switch to English',
    'toolbar.hideMinimap': 'Скрыть миниатюру',
    'toolbar.showMinimap': 'Показать миниатюру',
    'props.floatingMode': 'Плавающий режим',
    'props.dockedMode': 'Закрепить справа',
    'props.expand': 'Развернуть',
    'props.collapse': 'Свернуть',
    'props.presets': 'Пресеты',
    'props.cardSection': 'Карточка',
    'props.onTap': 'При нажатии',
    'db.welcomePlaceholder': 'Привет! Я бот.',
    'db.fallbackPlaceholder': 'Извините, я вас не понял.',
    'db.helpTextPlaceholder': 'Я — бот-помощник.',
    'toolbar.botSettings': 'Настройки бота',
    'platform.alisa': 'Алиса',
    'platform.telegram': 'Telegram',
    'platform.vk': 'VK',
    'platform.marusia': 'Маруся',
    'platform.max': 'Max',
    'platform.viber': 'Viber',
    'platform.smartApp': 'SmartApp',

    // Context menu
    'contextMenu.command': 'Команда',
    'contextMenu.step': 'Шаг',
    'contextMenu.response': 'Ответ',
    'contextMenu.action': 'Действие',
    'contextMenu.condition': 'Условие',
    'contextMenu.end': 'Завершение',
    'contextMenu.duplicate': 'Дублировать',

    // Canvas
    'canvas.edgeDelete': 'Удалить связь (или нажмите Delete)',

    // Chat preview

    // Save indicator
} as const;
