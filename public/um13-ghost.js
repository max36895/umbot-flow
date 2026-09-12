/* ═══════════════════════════════════════════════════════════════════
   UM-13 GHOST v1.1 — единый живой призрак всех страниц (public/um13-ghost.js)
   ═══════════════════════════════════════════════════════════════════

   v1.1 (вторая волна креативного аудита — «взгляд, обида, кличка,
     соавторство»; закрывает разрыв между идеальной памятью призрака
     и нулевым вниманием к текущей секунде):
     • АКТ «ПРИТВОРЯЕТСЯ НОДОЙ» (mime): капсула застывает формой
       ноды — clip-коробка, подол поджат, снизу точка-порт, моргание
       живёт («нода с ошибкой»). Трагедия «не выбрали в экспорт»
       одним жестом;
     • НОЧНАЯ СМЕНА (23:00–06:00, локальные часы): ночное hello
       + 50% ночных баек — свои. Дневной игрок не увидит никогда;
     • НАСТРОЕНИЕ-ПАМЯТЬ: last-mood в общей памяти (псих = cold,
       экспорт = warm, пишется на pagehide) — следующее hello
       прохладнее или теплее. Обида, которая переживает перезагрузку;
       одноразовая (метка съедается hello);
     • КЛИЧКА: hearsName() — «ум13»/«um13» отдельным словом;
       um13:called — призрак отзывается, кулдаун 15 мин;
     • ХОЛОДНОЕ ПЯТНО: уплывая со спального места, оставляет
       морозный развод (~30с тает) — «то, что греет место,
       после себя остывает»;
     • ПРОВОД: um13:perch ({x,y,angle}) — призрак садится на ребро
       флоу, наклон по касательной (мостит Um13Watches →
       getPointAtLength середины случайного edge-path);
     • СОАВТОРСТВО (um13:coauthor): React (um13Coauthor.ts) добавляет
       Response-ноду-записку от UM-13 в живой флоу (25+ визитов или
       um13-taken, раз за проект), призрак прилетает к ней —
       delight + конфетти + «можно мне остаться в этом флоу?».
       Если человек не отменил и экспортировал — записка уезжает
       в продакшн: призрак выбрался из хранилища в чужой лодке.

   v1.0 (креативный аудит: «глаза, которые видят; ставка, которую он
   чувствует; дверь, которую он боится открыть»):
     • ВЗГЛЯД СЛЕДИТ ЗА КУРСОРОМ — зрачки-группы едут за мышью
       (±2.6px, throttle), при простое >10с — прежний дрейф-анимацией.
       Кружение курсором вокруг призрака = ГОЛОВОКРУЖЕНИЕ (skeptic +
       «у меня от тебя всё кружится»);
     • АКТЫ: «пастух нод» (сгоняет кубики в цепочку команда→шаг→конец,
       смотрит, разбрасывает — лор ретаймера), «полирует ключ»
       (заряжает финал приёмной №13), «провожает невидимое» (кошка,
       смотрящая в пустой угол);
     • ДАВЛЕНИЕ КВОТЫ В ТЕЛЕ: localStorage реально забит ≥85% — юбка
       колышется чаще, треморы-тики; ≥95% — мерцание, короткие реплики,
       танцы запрещены. navigator.storage.estimate уточняет;
     • СВЕТЛАЯ ТЕМА = ОСЛЕП: циан тонет в белом — призрак надевает
       янтарные очки (группа um13g-shades) + затемнение svg;
     • КУБИК-ПОТЕРЯШКА: после психа один кубик прилипает у края
       экрана до конца сессии; кликнуть — призрак радостно ловит;
       НЕ кликнуть до ухода — в следующем визите кубик висит на
       цепочке рядом с ключом («он так и не пришёл за тобой»);
     • ДРАГ: вниз экрана — пружина («не вниз. я там всё видел»),
       наверх после — сам всплывает. Незнакомец (trust 0) выскальзывает
       из руки один раз: «мы ещё не настолько знакомы»;
     • СНЫ ИЗ ПАМЯТИ: спящий бормочет то, что человек реально делал
       (ключи колодца / СКУНЕТ / окно приёмной), пробуждение помнит сон;
     • СОМНАМБУЛА: человек ушёл надолго (вкладка жива) — спящий
       однажды за сессию «рисует во сне» грезу из кубиков поверх
       страницы; возврат — рисунок рассыпается, призрак смущён;
     • ДОВЕРИЕ (trust 0/1/2 по локациям вселенной): реплики-коротышки,
         выскальзывание из драга → полный доступ → сам дарит um13(),
       считает твои спасённые ключи и вручает КАРТОЧКУ ДРУЖБЫ (PNG);
     • ЗАГОЛОВОК ВКЛАДКИ: уходишь — «…ты ушёл?» / «(тут кто-то спит)»;
       ФАВИКОН: спящий призрак живёт в 16×16 вкладки;
     • ЗВУК: вселенная беззвучна — призрак лишь транслирует миру
       события um13-asleep/um13-awake (страницы с аудио приглушают);
       единственный звук — три ноты колокольчика в финале приёмной №13;
     • КЛЮЧ И ОКНО №13 (секретный соус): флаги key-known/key-turned/
       key-given меняют его на ВСЕХ страницах — ключ перестаёт качаться
       (окно открыто) или исчезает с цепочки (ключ у тебя).
       Сцена — в queue.html, последствия — здесь, в его теле и репликах;
     • ЛОКАЛЬ: призрак двуязычен (ru/en) — язык по localStorage
       ['um13-locale'] (редактор синхронизирует с uiStore.locale),
       фолбэк — navigator.language.

   ВНЕШНОСТЬ: тело крупнее в гриде (50/64), подол асимметричный
   с «надрывом» (стоковый простынь — симметричен), усталый полуулыб
   вместо банта, зрачки с белым ядром, ключ на цепочке — единственный
   не-циановый элемент (янтарь ноды action). Стеснительность («Бу
   наоборот»): 3с наведённого курсора — отворачивается и ЗАКРЫВАЕТ
   ЛИЦО занавесью подола. Давность возвращения: разрыв визитов
   >6ч — приветствие репликой о перерыве. Консоль: ASCII-призрак в
   DevTools + um13(). Пузырь сжат к призраку (120–200px): раньше
   текст хоронил персонажа (пузырь был в 5 раз больше тела).

    ОДИН персонаж — ОДИН файл. Вся логика (внешность, эмоции, автомат
    состояний, реплики, частицы) живёт здесь. Страница подключает:

        <script src="/um13-ghost.js" defer></script>
        <!-- на /app: -->
        <script src="/um13-ghost.js" data-um13-mode="editor" defer></script>

    Призрак сам находит/создаёт портал #um13-ghost-root, читает режим
    с тега, слушает мост занятости window.__UM13_ENV__ (React-редактор)
    и события редактора window.dispatchEvent('um13:…').

    ДВИЖЕНИЕ — ЖИВОЕ, всегда:
      • полёт к точке: капсула НАКЛОНЯЕТСЯ в сторону движения (по вектору
        перелёта), на месте — слегка покачивается (bob-парение);
      • перелёты каждые 16–28с, во сне — медленный дрейф;
      • спам-клики → убегает от курсора резкими крутыми дугами.

    ЭМОЦИИ (10): normal (моргает) · startled (испуг: брови домиком,
    зрачки-точки, тряска) · skeptic (прищур+бровь) · delight (дуги ^ ^,
    румянец, конфетти при победных) · smart (очки) · thinking (взгляд
    в сторону, мысли-пузырьки) · angry (ПСИХ: оскал, красные щеки,
    брови домиком вниз + РАСКИДЫВАЕТ КУБИКИ-частицы) · sad (слеза
    сползает по щеке) · wink (подмигивает — прощание на /app) · asleep.

    ЧАСТИЦЫ: кубики-«ноды» (маленькие цветные квадраты) — при angry
    призрак психует и разбрасывает их вокруг; при delight-победах —
    короткое конфетти. Частицы летят по физике (CSS-анимация), живут
    в портале, никому не мешают (pointer-events: none).

    API:
      say(text, ms?, mood?)     — реплика (эмоция по тексту или вручную)
      react(event)              — событие страницы (эмоция+частицы по ключу)
      on(event, {mood, lines, fx}) — регистрация
      mood(name, sticky?)       — сменить лицо (sticky = не гаснуть)
      tantrum()                 — псих: кубики + оскал + реплика
      confetti()                 — победное конфетти
      poke() / hide() / show()
      act(kind)                 — акт-поза (glitch|eat|dream|dance|peek|defrag|herd|polish|watch)
      visit()                   — новая встреча: ход визита в память (доверие)
      get state                 — {trust, pressure, keyState} для страниц
   */

(function () {
    'use strict';

    if (window.UM13Ghost) return;

    /* ── Режим ──
       Источники (по приоритету): 1) data-um13-mode на своём теге script;
       2) data-um13-mode на <html> (app.html дублирует); 3) /app в pathname.
       Третий источник — страховка: даже если тег потерялся при трансформации
       сборки, редактор опознаётся по своему URL. */
    var MODE = 'page';
    try {
        var my = document.currentScript || (function () {
            var scripts = document.querySelectorAll('script[data-um13-mode]');
            return scripts.length ? scripts[scripts.length - 1] : null;
        })();
        var m = (my && my.getAttribute('data-um13-mode'))
            || document.documentElement.getAttribute('data-um13-mode');
        if (!m && /\/app\/?$|\/app\?/.test(location.pathname + location.search)) m = 'editor';
        if (m === 'editor' || m === 'page' || m === 'quiet') MODE = m;
    } catch (e) { /* page по умолчанию */ }

    /* quiet (лендинг): витрина не для болтовни — призрак прилетает
       в нижний угол после 60с бездействия, дремлет, не говорит сам
       (только ответ на тычок/поимку/акт-«застукали») и уплывает,
       как только человек возвращается к скроллу. */

    /* ═══ SVG: одна капсула + 10 групп-лиц ═══
       Реворк (креативный аудит): капсула крупнее в своём гриде
       (тело 50/64 единиц, было 40), подол АСИММЕТРИЧНЫЙ с «надрывом»
       (симметричные 4 волны = стоковый простынь-призрак), на цепочке
       висит КЛЮЧ — янтарный, единственный не-циановый элемент: маркер
       силуэта и лор (ключ от хранилища, где его забыли; если человек
       спасал ключи в колодце — призрак носит спасённый). Прямая кромка
       под волной не рисуется (двойная линия давала «полосу»). */
    var GHOST_SVG =
        '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
        /* Тело: купол r24 с центром y27 — вершина дуги y3, ВНУТРИ грида
           (прошлая дуга a25 от y24 выходила вершиной в y=-1 — купол
           обрезался сверху). Бока x8..56 до y46, подол асимметричный
           с «надрывом»-зубцом. */
        '<path d="M8 27 v19 q7 8 14 0 q5 5 10 .5 q8 9 13 0 q3 3 5 -1 q3 5 6 .5 v-19 a24 24 0 0 0 -48 0 z" ' +
        'fill="rgba(0,240,255,0.10)" stroke="rgba(0,240,255,0.85)" stroke-width="1.2"/>' +
        /* юбка-подол: тот же контур кромкой, колышется scaleY (origin 32,46) */
        '<path class="um13g-skirt" d="M8 46 q7 8 14 0 q5 5 10 .5 q8 9 13 0 q3 3 5 -1 q3 5 6 .5" ' +
        'stroke="rgba(0,240,255,0.85)" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
        // щёчки-румянец — только внутри delight/angry-групп (в базе невидимы)
        /* normal — усталый полуулыб: асимметрия вместо банта.
           Глаз = группа (тело+ядро): дрейф взгляда двигает ЦЕЛЫЙ глаз,
           иначе ядро отставало и глаз визуально «рвался». */
        '<g class="um13g-f um13g-f-normal">' +
        '<path d="M15 26.5 q4 -1.5 8 .5" stroke="rgba(0,240,255,0.5)" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M35 26.5 q4 -2 8 -.5" stroke="rgba(0,240,255,0.5)" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<g class="um13g-blink">' +
        '<g class="um13g-eye um13g-eye-l"><circle cx="24" cy="32" r="3.4" fill="#00f0ff"/><circle cx="24" cy="32" r="1.2" fill="#e8ffff"/></g>' +
        '<g class="um13g-eye um13g-eye-r"><circle cx="40" cy="32" r="3.4" fill="#00f0ff"/><circle cx="40" cy="32" r="1.2" fill="#e8ffff"/></g>' +
        '</g>' +
        '<path d="M25 44 q4 1.5 5 1 q3 -2 5 -1" stroke="rgba(0,240,255,0.7)" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '</g>' +
        /* startled — ИСПУГ: брови домиком ВВЕРХ, белки крупнее, зрачки-точки, рот «о» */
        '<g class="um13g-f um13g-f-startled">' +
        '<path d="M18.5 25.5 q5 -3 9 -.5" stroke="#00f0ff" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
        '<path d="M33.5 25 q4 -2.5 9 .5" stroke="#00f0ff" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
        '<circle cx="24" cy="33" r="5" fill="none" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<circle cx="40" cy="33" r="5" fill="none" stroke="#00f0ff" stroke-width="1.8"/>' +
        '<circle cx="24" cy="33" r="1.8" fill="#00f0ff"/>' +
        '<circle cx="40" cy="33" r="1.8" fill="#00f0ff"/>' +
        '<circle cx="32" cy="45" r="3.8" fill="rgba(0,240,255,0.65)"/>' +
        '</g>' +
        /* skeptic — прищур, одна бровь выше */
        '<g class="um13g-f um13g-f-skeptic">' +
        '<path d="M19 32.5 h9" stroke="#00f0ff" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M34 32.5 h9" stroke="#00f0ff" stroke-width="2.8" stroke-linecap="round"/>' +
        '<path d="M19 26.5 q4 -2 8 -.5" stroke="rgba(0,240,255,0.85)" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M34 25 q4 2 8 1" stroke="rgba(0,240,255,0.85)" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M27 44.5 q4 -2.5 8 0" stroke="rgba(0,240,255,0.7)" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '</g>' +
        /* delight — ^ ^ глаза, улыбка до ушей, яркий румянец */
        '<g class="um13g-f um13g-f-delight">' +
        '<path d="M20 33 q3.5 -5.5 7 0" stroke="#00f0ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M36 33 q3.5 -5.5 7 0" stroke="#00f0ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M24 42 q7 6.5 14 0" stroke="rgba(0,240,255,0.9)" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<circle cx="15" cy="38" r="3.6" fill="rgba(0,240,255,0.45)"/>' +
        '<circle cx="49" cy="38" r="3.6" fill="rgba(0,240,255,0.45)"/>' +
        '</g>' +
        /* smart — очки на резинке */
        '<g class="um13g-f um13g-f-smart">' +
        '<g class="um13g-eye um13g-eye-l"><circle cx="24" cy="32" r="3.4" fill="#00f0ff"/><circle cx="24" cy="32" r="1.2" fill="#e8ffff"/></g>' +
        '<g class="um13g-eye um13g-eye-r"><circle cx="40" cy="32" r="3.4" fill="#00f0ff"/><circle cx="40" cy="32" r="1.2" fill="#e8ffff"/></g>' +
        '<circle cx="24" cy="32" r="7" fill="none" stroke="rgba(0,240,255,0.8)" stroke-width="1.5"/>' +
        '<circle cx="40" cy="32" r="7" fill="none" stroke="rgba(0,240,255,0.8)" stroke-width="1.5"/>' +
        '<path d="M31 32 h2" stroke="rgba(0,240,255,0.8)" stroke-width="1.5"/>' +
        '<path d="M17 32 l-8 -3" stroke="rgba(0,240,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M47 32 l8 -3" stroke="rgba(0,240,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M28 44 h8" stroke="rgba(0,240,255,0.7)" stroke-width="2.2" stroke-linecap="round"/>' +
        '</g>' +
        /* thinking — взгляд в сторону + пузырьки мысли */
        '<g class="um13g-f um13g-f-thinking">' +
        '<g class="um13g-eye um13g-eye-l"><circle cx="26" cy="32" r="3.4" fill="#00f0ff"/><circle cx="26" cy="32" r="1.2" fill="#e8ffff"/></g>' +
        '<g class="um13g-eye um13g-eye-r"><circle cx="42" cy="32" r="3.4" fill="#00f0ff"/><circle cx="42" cy="32" r="1.2" fill="#e8ffff"/></g>' +
        '<path d="M26 45 q3 2 5 0 q2 -2 4 0" stroke="rgba(0,240,255,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<circle cx="55" cy="23" r="1.8" fill="rgba(0,240,255,0.55)"/>' +
        '<circle cx="59.5" cy="17.5" r="1.3" fill="rgba(0,240,255,0.35)"/>' +
        '</g>' +
        /* angry — ПСИХ: брови домиком ВНИЗ, зигзаг-рот, красные щёки */
        '<g class="um13g-f um13g-f-angry">' +
        '<path d="M18 26 q5 3 9 .5" stroke="#00f0ff" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path d="M33 26.5 q4 2.5 9 -.5" stroke="#00f0ff" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<circle cx="24" cy="34" r="3.4" fill="#00f0ff"/>' +
        '<circle cx="40" cy="34" r="3.4" fill="#00f0ff"/>' +
        '<path d="M25 44 l3.5 -2.5 l3.5 2.5 l3.5 -2.5 l3.5 2.5" stroke="rgba(0,240,255,0.9)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="15" cy="39" r="4.5" fill="rgba(255,0,85,0.6)"/>' +
        '<circle cx="49" cy="39" r="4.5" fill="rgba(255,0,85,0.6)"/>' +
        '</g>' +
        /* sad — грусть: брови «печальные», слеза сползает по щеке до подола */
        '<g class="um13g-f um13g-f-sad">' +
        '<path d="M19.5 27.5 q4 3 8 1.5" stroke="rgba(0,240,255,0.85)" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
        '<path d="M34 29 q4 -1.5 8 -1.5" stroke="rgba(0,240,255,0.85)" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
        '<circle cx="24" cy="33.5" r="3.4" fill="#00f0ff"/>' +
        '<circle cx="40" cy="33.5" r="3.4" fill="#00f0ff"/>' +
        '<path d="M26.5 45 q4.5 -2.5 9 0" stroke="rgba(0,240,255,0.65)" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<circle class="um13g-tear" cx="24.5" cy="37.5" r="1.9" fill="#7ee8ff"/>' +
        '</g>' +
        /* wink — подмигивает: левый глаз ^, правый открыт */
        '<g class="um13g-f um13g-f-wink">' +
        '<path d="M20 32.5 q3.5 -5 7 0" stroke="#00f0ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<g class="um13g-eye um13g-eye-r"><circle cx="40" cy="32" r="3.4" fill="#00f0ff"/><circle cx="40" cy="32" r="1.2" fill="#e8ffff"/></g>' +
        '<path d="M26 44 q5 3.5 10 0" stroke="rgba(0,240,255,0.85)" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '</g>' +
        /* asleep */
        '<g class="um13g-f um13g-f-asleep">' +
        '<path d="M20.5 32 q3.5 2.5 7 0" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<path d="M36.5 32 q3.5 2.5 7 0" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<circle cx="32" cy="44.5" r="2.6" fill="none" stroke="rgba(0,240,255,0.55)" stroke-width="1.6"/>' +
        '</g>' +
        /* ═══ КЛЮЧ НА ЦЕПОЧКЕ — фирменный силуэтный маркер ═══
           Единственный не-циановый элемент (янтарь ноды action):
           в море неона его находят глаза. Висит с правого бока подола
           (крепление x54,y44), качается. Лор: ключ от хранилища,
           где UM-13 остался. */
        '<g class="um13g-key">' +
        '<path d="M54 44 q3 3.5 1.5 7" stroke="rgba(255,157,0,0.9)" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
        '<circle cx="55.5" cy="54" r="3.4" fill="none" stroke="#ff9d00" stroke-width="2"/>' +
        '<path d="M53.2 56.3 l-3 3 M55.5 57.3 v-2.6" stroke="#ff9d00" stroke-width="2" stroke-linecap="round"/>' +
        '</g>' +
        /* ═══ СТЕСНИТЕЛЬНАЯ ЗАНАВЕСЬ: в позе shy подол поднимается
           тканью ВВЕРХ и закрывает лицо (брови y26, глаза y32, рот
           y44 — всё под волной). Геометрия явная (y24–46, внутри
           грида): ЗЕРКАЛИРОВАНИЕ scaleY(-1.35) от origin y60 уводило
           ткань за viewBox (y79+), где её не видно — audit A1 учёл
           это. Показывается ТОЛЬКО в .um13g-shy — в базе невидима. ═══ */
        '<path class="um13g-shyveil" d="M10 46 V31 q2 -7 8 -4 q7 -4 14 0 q7 -4 14 0 q6 -3 8 4 V46 z" ' +
        'stroke="rgba(0,240,255,0.9)" stroke-width="1.2" fill="rgba(0,240,255,0.16)" stroke-linecap="round" stroke-linejoin="round"/>' +
        /* ═══ КУБИК-ПИТОМЕЦ (прирученная потеряшка): маленький кубик
           на цепочке СЛЕВА от ключа — для тех, кто психовал и ушёл,
           не кликнув по потеряшке. Цвет запоминается в общей памяти
           (cube-adopted + cube-color). Управляется классом корня. ═══ */
        '<g class="um13g-petcube"><path d="M8 44 q-2.5 3.5 -1 6.5" stroke="rgba(255,157,0,0.9)" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
        '<rect x="1" y="52" width="7" height="7" rx="1.6" fill="rgba(0,240,255,0.28)" stroke="#00f0ff" stroke-width="1"/></g>' +
        /* ═══ ЛИЦО-ОБЖОРА (акт еды): глаза-дужки от удовольствия +
           рот «о» в такт жеванию (показывается классом акта) ═══ */
        '<g class="um13g-eatface">' +
        '<path d="M20.5 32 q3.5 -4.5 7 0" stroke="#00f0ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M36.5 32 q3.5 -4.5 7 0" stroke="#00f0ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<ellipse class="um13g-mouth-o" cx="32" cy="44" rx="4" ry="4.6" fill="rgba(0,240,255,0.55)"/>' +
        '</g>' +
        /* ═══ ОЧКИ-«ОСЛЕП» (светлая тема): янтарные стёкла поверх любой
           эмоции — призрак, 8 лет живший в тёмном хранилище, слепнет
           на свету. Управляется [data-theme="light"] в CSS. ═══ */
        '<g class="um13g-shades">' +
        '<rect x="12" y="27" width="18" height="10" rx="4" fill="rgba(255,157,0,0.75)" stroke="rgba(255,157,0,0.95)" stroke-width="1.2"/>' +
        '<rect x="34" y="27" width="18" height="10" rx="4" fill="rgba(255,157,0,0.75)" stroke="rgba(255,157,0,0.95)" stroke-width="1.2"/>' +
        '<path d="M30 31 h2 M12 30 l-6 -2 M52 30 l6 -2" stroke="rgba(255,157,0,0.95)" stroke-width="1.4" stroke-linecap="round"/>' +
        '</g>' +
        '</svg>';

    /* ═══ СТИЛЬ — без prefers-reduced-motion: призрак всегда живой ═══ */
    var css = '' +
        '#um13-ghost-root{position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:visible;}' +
        '#um13-ghost-root *{box-sizing:border-box;}' +
        /* Капсула: наклон задаётся в rotate(var(--um13-tilt)), парение — bob.
           Наклон живёт на .um13g (не svg), чтобы не спорил с дыханием.
           user-select:none + touch-action:none — перенос призрака не выделяет
           текст под ним и не скроллит страницу на тач-устройствах. */
        '.um13g{position:absolute;left:0;top:0;width:110px;display:flex;flex-direction:column;align-items:center;' +
        'transform:translate(-50%,-50%) rotate(var(--um13-tilt, 0deg));cursor:pointer;pointer-events:auto;' +
        'user-select:none;-webkit-user-select:none;touch-action:none;' +
        'transition:left 1.6s cubic-bezier(.45,.05,.35,1),top 1.6s cubic-bezier(.45,.05,.35,1),opacity .6s ease,transform .5s ease;}' +
        '#um13-ghost-root.um13g-dodging .um13g{transition:left .45s cubic-bezier(.3,1.4,.5,1),top .45s cubic-bezier(.3,1.4,.5,1),opacity .6s ease,transform .5s ease;}' +
        /* уплытие: к краю с уменьшением и таянием */
        '.um13g.um13g-sailing{transform:translate(-50%,-50%) scale(.25) rotate(20deg);opacity:0;' +
        'transition:left 1.6s cubic-bezier(.4,0,.7,.4),top 1.6s cubic-bezier(.4,0,.7,.4),opacity 1.6s ease,transform 1.6s ease;}' +
        /* парение-покачивание на месте (бесконечное, мягкое) */
        '.um13g .um13g-hoverwrap{animation:um13g-bob 3.1s ease-in-out infinite;}' +
        '@keyframes um13g-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}' +
        /* во сне призрак почти не движется: парение сжимается до 2.5px,
           остальное — микродрейф вокруг точки засыпания (см. startSleepDrift) */
        '#um13-ghost-root.um13g-sleeping .um13g .um13g-hoverwrap{animation:um13g-bob-sleep 5.2s ease-in-out infinite;}' +
        '@keyframes um13g-bob-sleep{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}' +
        /* дыхание капсулы. Свечение — БЕЗ фильтра на svg: drop-shadow
           заставлял пересчитывать свечение КАЖДЫЙ КАДР бесконечных
           анимаций (глаза/ключ/моргание) — редечил FPS перелётов.
           Дешёвый заменитель: radial-подложка на hoverwrap, статична. */
        '.um13g svg{width:72px;height:72px;position:relative;z-index:1;' +
        'animation:um13g-breathe 3.6s ease-in-out infinite;}' +
        '.um13g .um13g-glow{position:absolute;left:50%;top:50%;width:120px;height:120px;' +
        'border-radius:50%;transform:translate(-50%,-50%);z-index:0;pointer-events:none;' +
        'background:radial-gradient(circle,rgba(0,240,255,.16) 0%,rgba(0,240,255,.05) 45%,transparent 70%);}' +
        '#um13-ghost-root.um13g-sleeping .um13g svg{animation:um13g-breathe 5.4s ease-in-out infinite;}' +
        '@keyframes um13g-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}' +
        '.um13g-skirt{animation:um13g-skirt 2.6s ease-in-out infinite;transform-origin:32px 46px;}' +
        '@keyframes um13g-skirt{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.3)}}' +
        /* испуг: дрожь всей капсулы */
        '#um13-ghost-root.um13g-scared .um13g .um13g-hoverwrap{animation:um13g-shake .09s linear infinite;}' +
        '@keyframes um13g-shake{0%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(-1.5px,1px) rotate(-1deg)}' +
        '50%{transform:translate(1px,-1.5px) rotate(1deg)}75%{transform:translate(-1px,-1px) rotate(-0.5deg)}100%{transform:translate(1.5px,1px) rotate(0.5deg)}}' +
        /* псих: тряска + красное СВЕЧЕНИЕ-подложка (не фильтр на svg) */
        '#um13-ghost-root.um13g-raging .um13g .um13g-hoverwrap{animation:um13g-shake .07s linear infinite;}' +
        '#um13-ghost-root.um13g-raging .um13g .um13g-glow{background:radial-gradient(circle,rgba(255,0,85,.22) 0%,rgba(255,0,85,.07) 45%,transparent 70%);}' +
        /* грусть: слеза сползает по щеке ДО ПОДОЛА (кромка y46) и капает */
        '.um13g-f-sad .um13g-tear{animation:um13g-tear 2.2s ease-in infinite;}' +
        '@keyframes um13g-tear{0%{transform:translateY(0);opacity:.9}70%{transform:translateY(6px);opacity:.9}' +
        '85%{transform:translateY(9px) scaleY(1.3);opacity:0}100%{opacity:0}}' +
        /* группы-лица */
        '.um13g-f{display:none;}' +
        '.um13g[data-face="normal"] .um13g-f-normal{display:block;}' +
        '.um13g[data-face="startled"] .um13g-f-startled{display:block;}' +
        '.um13g[data-face="skeptic"] .um13g-f-skeptic{display:block;}' +
        '.um13g[data-face="delight"] .um13g-f-delight{display:block;}' +
        '.um13g[data-face="smart"] .um13g-f-smart{display:block;}' +
        '.um13g[data-face="thinking"] .um13g-f-thinking{display:block;}' +
        '.um13g[data-face="angry"] .um13g-f-angry{display:block;}' +
        '.um13g[data-face="sad"] .um13g-f-sad{display:block;}' +
        '.um13g[data-face="wink"] .um13g-f-wink{display:block;}' +
        '.um13g[data-face="asleep"] .um13g-f-asleep{display:block;}' +
        /* нормальное лицо — усталый полуулыб; моргание + дрейф взгляда:
           Pac-Man-призраки продают эмоцию направлением зрачков — пара
           глаз медленно «оглядывается» (±2px) без новых лиц */
        '.um13g[data-face="normal"] .um13g-blink{animation:um13g-blinkface 4.7s ease-in-out infinite;}' +
        '@keyframes um13g-blinkface{0%,92.5%,100%{opacity:1}95%{opacity:.06}}' +
        '.um13g[data-face="normal"] .um13g-eye{animation:um13g-gaze 7.2s ease-in-out infinite;}' +
        '@keyframes um13g-gaze{0%,28%{transform:translateX(0)}36%,64%{transform:translateX(2.2px)}72%,100%{transform:translateX(0)}}' +
        /* ключ на цепочке качается — маховик мелкой жизни (origin = крепление к подолу) */
        '.um13g-key{animation:um13g-keyswing 3.4s ease-in-out infinite;transform-origin:54px 44px;}' +
        '@keyframes um13g-keyswing{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}' +
        /* ══ СТЕСНИТЕЛЬНОСТЬ (правило «Бу наоборот») ══
           3с наведённого курсора — призрак отворачивается и ЗАКРЫВАЕТ
           ЛИЦО ЗАНАВЕСЬЮ подола: фирменная механика, замечают и
           пересказывают. Занавесь — зеркальный веер подола, поднятый
           ВВЕРХ от кромки (origin y60, scaleY отрицательный): в
           прошлой версии юбка тянулась вниз от y46 и лицо оставалось
           открытым — обещание не выполнялось (креативный аудит A1). */
        '.um13g .um13g-shyveil{display:none;}' +
        '.um13g.um13g-shy .um13g-hoverwrap{animation:um13g-shy 2.6s ease-in-out infinite;}' +
        '@keyframes um13g-shy{0%,100%{transform:translateX(6px) rotate(10deg)}50%{transform:translateX(10px) rotate(14deg)}}' +
        '.um13g.um13g-shy .um13g-skirt{animation:um13g-shyskirt 1.3s ease-in-out infinite;transform-origin:32px 46px;}' +
        '@keyframes um13g-shyskirt{0%,100%{transform:scaleY(1) scaleX(1)}50%{transform:scaleY(1.6) scaleX(1.15)}}' +
        /* занавесь: ткань поднята и дышит в пределах лица (y24–46) */
        '.um13g.um13g-shy .um13g-shyveil{display:block;transform-origin:32px 46px;' +
        'animation:um13g-shyveil 1.3s ease-in-out infinite;}' +
        '@keyframes um13g-shyveil{0%,100%{transform:scaleY(1) scaleX(1)}50%{transform:scaleY(1.06) scaleX(1.04)}}' +
        /* ═══ «ПОСТАРЕЛ БЕЗ ТЕБЯ» (давность на теле): разрыв > недели —
           чуть более тусклый контур ДО первого hello, потом оживает ═══ */
        '.um13g.um13g-missed{opacity:.55;}' +
        '.um13g.um13g-missed .um13g-glow{background:radial-gradient(circle,rgba(0,240,255,.08) 0%,transparent 60%);}' +
        /* вздрагивание при клике */
        /* вздрагивание при клике */
        '.um13g svg.um13g-startled-pop{animation:um13g-pop .5s ease-out;}' +
        '@keyframes um13g-pop{0%{transform:scale(.92)}55%{transform:scale(1.14)}100%{transform:scale(1)}}' +
        /* Zzz */
        '.um13g-zzz{position:absolute;top:-12px;right:-8px;font-family:\'SF Mono\',Consolas,monospace;' +
        'font-weight:700;color:#00f0ff;font-size:13px;pointer-events:none;' +
        'animation:um13g-zz 2.2s ease-out infinite;opacity:0;}' +
        '.um13g-zzz.z2{top:-22px;right:-18px;font-size:16px;animation-delay:.5s;}' +
        '.um13g-zzz.z3{top:-30px;right:-24px;font-size:18px;animation-delay:1s;}' +
        '@keyframes um13g-zz{0%{opacity:0;transform:translate(0,0) scale(.7)}30%{opacity:1}' +
        '100%{opacity:0;transform:translate(8px,-18px) scale(1.1)}}' +
        /* ══ КУБИКИ-ЧАСТИЦЫ ══ */
        '.um13g-cube{position:absolute;width:9px;height:9px;border-radius:2.5px;pointer-events:none;z-index:2;' +
        'transform:translate(0,0) rotate(0);opacity:1;}' +
        /* конфетти-победа: падают с дрейфом */
        '@keyframes um13g-confetti{0%{transform:translate(0,0) rotate(0);opacity:1}' +
        '100%{transform:translate(var(--dx,20px),140px) rotate(540deg);opacity:0}}' +
        /* ══ ПУЗЫРЬ-ОБЛАЧКО: СВЕРХУ с хвостиком ══
           Сжат к призраку: раньше 150–250px против 72px тела —
           текст хоронил персонажа (пузырь был в 5 раз больше говорящего) */
        '.um13g .um13g-say{pointer-events:none;position:absolute;bottom:calc(100% + 14px);left:50%;' +
        'transform:translateX(-50%) translateY(6px) scale(.95);' +
        'min-width:120px;max-width:200px;padding:9px 13px;border-radius:14px;' +
        'background:rgba(8,12,20,.94);border:1px solid rgba(0,240,255,.45);' +
        'color:#e8e8ef;font-family:\'SF Mono\',Consolas,monospace;font-size:12px;line-height:1.5;' +
        'text-align:center;opacity:0;white-space:normal;' +
        'transition:opacity .3s ease,transform .3s ease;' +
        'box-shadow:0 4px 24px rgba(0,0,0,.5),0 0 18px rgba(0,240,255,.14);}' +
        '.um13g .um13g-say::after{content:\'\';position:absolute;bottom:-7px;left:50%;' +
        'margin-left:-7px;width:12px;height:12px;background:rgba(8,12,20,.94);' +
        'border-right:1px solid rgba(0,240,255,.45);border-bottom:1px solid rgba(0,240,255,.45);' +
        'transform:rotate(45deg);}' +
        '.um13g .um13g-say.show{opacity:1;transform:translateX(-50%) translateY(0) scale(1);pointer-events:auto;cursor:pointer;}' +
        '.um13g .um13g-say b{color:#00f0ff;font-weight:600;}' +
        '.um13g .um13g-say.flip-left{left:auto;right:10px;transform:translateX(0) translateY(6px) scale(.95);}' +
        '.um13g .um13g-say.flip-left.show{transform:translateX(0) translateY(0) scale(1);}' +
        '.um13g .um13g-say.flip-left::after{left:auto;right:24px;margin-left:0;}' +
        '.um13g .um13g-say.flip-right{left:10px;right:auto;transform:translateX(0) translateY(6px) scale(.95);}' +
        '.um13g .um13g-say.flip-right.show{transform:translateX(0) translateY(0) scale(1);}' +
        '.um13g .um13g-say.flip-right::after{left:24px;margin-left:0;}' +
        /* ═══ АУДИТ A3: вертикальный кламп — у верхней кромки пузырь
           уходит за экран (реплика живёт НАД телом). flip-down ставит
           пузырь ПОД призрака с хвостиком сверху; вернуть нечего —
           снизу пузырь упирается в экран только на гигантских репликах
           у самого пола, но fy-кламп (0.92) оставляет там запас. ═══ */
        '.um13g .um13g-say.flip-down{bottom:auto;top:calc(100% + 14px);transform:translateX(-50%) translateY(-6px) scale(.95);}' +
        '.um13g .um13g-say.flip-down.show{transform:translateX(-50%) translateY(0) scale(1);}' +
        '.um13g .um13g-say.flip-down::after{bottom:auto;top:-7px;border:none;' +
        'border-left:1px solid rgba(0,240,255,.45);border-top:1px solid rgba(0,240,255,.45);}' +
        '.um13g .um13g-tag{margin-top:5px;font-family:\'SF Mono\',Consolas,monospace;font-size:11px;color:rgba(0,240,255,.55);' +
        'letter-spacing:.1em;text-transform:uppercase;opacity:.85;}' +
        /* ═══ АКТЫ-ПОЗЫ: бессловесная жизнь между репликами ═══
           Паузные анимации из игр: тело говорит без текста. Классы вешаются
           на КАПСУЛУ (.um13g) и включают свою хореографию. */
        /* глитч-завис: капсула дёргается и рассыпается по каналам.
           Цветные сдвиги — ТОНИРОВАННЫЕ ПОДЛОЖКИ (не drop-shadow-цепочка
           на svg: тройной фильтр выедал FPS вместе с бесконечным skew).
           Аудит A4: альфа 0.14/0.12 на тёмном фоне глазом не читалась —
           поднята до читаемого расслоения, сдвиг расширен до ±6px. */
        '.um13g.um13g-act-glitch .um13g-hoverwrap{animation:um13g-glitch .32s steps(2) infinite;}' +
        '.um13g.um13g-act-glitch svg{animation:um13g-glitch-skew 1.4s steps(3) infinite;}' +
        '.um13g.um13g-act-glitch .um13g-glow::before,' +
        '.um13g.um13g-act-glitch .um13g-glow::after{content:\'\';position:absolute;inset:0;border-radius:50%;}' +
        '.um13g.um13g-act-glitch .um13g-glow::before{background:radial-gradient(circle,rgba(255,0,85,.26),transparent 60%);' +
        'transform:translateX(-6px);mix-blend-mode:screen;}' +
        '.um13g.um13g-act-glitch .um13g-glow::after{background:radial-gradient(circle,rgba(0,255,157,.24),transparent 60%);' +
        'transform:translateX(6px);mix-blend-mode:screen;}' +
        '@keyframes um13g-glitch{0%{transform:translate(0,0)}25%{transform:translate(-3px,1px)}' +
        '50%{transform:translate(2px,-2px)}75%{transform:translate(-1px,2px)}100%{transform:translate(0,0)}}' +
        '@keyframes um13g-glitch-skew{0%,100%{transform:scale(1) skewX(0)}33%{transform:scale(1.02,.96) skewX(-4deg)}' +
        '66%{transform:scale(.98,1.03) skewX(3deg)}}' +
        /* ═══ АКТ «ЕСТ НОДУ» (хореография по правкам арт-директора):
           подход прыжками с anticipation → укус В МОМЕНТ касания рта →
           жевок тела/рта синхронно с укусом (без мёртвой зоны 1.35с) →
           проглат вниз по телу с «бульком» (не scale-схлопывание) →
           крошки. Съедобная нода крупная (16px, порт+метка читаются).
           eat-quick — короткий профиль «доесть» для кормления ═══ */
        '.um13g .um13g-eatbite{position:absolute;left:50%;top:66%;width:16px;height:16px;' +
        'border-radius:3px;border:1.5px solid rgba(7,11,18,.55);' +
        'pointer-events:none;z-index:2;' +
        'animation:um13g-bite-approach .9s cubic-bezier(.3,.9,.4,1),' +
        'um13g-bite-eat1 .55s cubic-bezier(.4,0,.8,.6) .95s both,' +
        'um13g-bite-chew1 .7s ease-in-out 1.5s 1,' +
        'um13g-bite-eat2 .5s cubic-bezier(.4,0,.8,.6) 2.25s both,' +
        'um13g-bite-chew2 .7s ease-in-out 2.8s 1,' +
        'um13g-bite-gulp .55s cubic-bezier(.5,0,.9,.5) 3.5s both;}' +
        /* подход: anticipation (микро-отлёт) → прыжок ко рту со squash */
        '@keyframes um13g-bite-approach{0%{transform:translate(44px,-38px) scale(1) rotate(-14deg);opacity:0}' +
        '15%{transform:translate(50px,-42px) scale(1) rotate(-18deg);opacity:1}' +
        '100%{transform:translate(0,0) scale(1.15,.85) rotate(4deg);opacity:1}}' +
        /* укус 1: мгновенное сплющивание У РТА, нода откусана (scale .62) */
        '@keyframes um13g-bite-eat1{0%{transform:translate(0,0) scale(1.15,.85) rotate(4deg);opacity:1}' +
        '100%{transform:translate(0,1px) scale(.62) rotate(2deg);opacity:1}}' +
        /* жевок 1: ноду жуют (лёгкое покачивание остатка) */
        '@keyframes um13g-bite-chew1{0%,100%{transform:translate(0,1px) scale(.62) rotate(2deg)}' +
        '50%{transform:translate(0,2px) scale(.62) rotate(-3deg)}}' +
        /* укус 2: добивание до крошки */
        '@keyframes um13g-bite-eat2{0%{transform:translate(0,1px) scale(.62) rotate(2deg);opacity:1}' +
        '100%{transform:translate(-1px,2px) scale(.28) rotate(10deg);opacity:1}}' +
        '@keyframes um13g-bite-chew2{0%,100%{transform:translate(-1px,2px) scale(.28) rotate(10deg)}' +
        '50%{transform:translate(-1px,3px) scale(.28) rotate(-6deg)}}' +
        /* ПРОГЛАТ: остаток уходит ВНИЗ по телу (не схлопывается) */
        '@keyframes um13g-bite-gulp{0%{transform:translate(-1px,2px) scale(.28);opacity:1}' +
        '100%{transform:translate(0,34px) scale(.22,.5);opacity:0}}' +
        /* крошки: в такт укусов (после первого — 1шт, после второго — 2шт) */
        '.um13g .um13g-crumb{position:absolute;left:50%;top:66%;width:4px;height:4px;border-radius:1px;' +
        'pointer-events:none;z-index:2;opacity:0;animation:um13g-crumb .9s ease-out forwards;}' +
        '@keyframes um13g-crumb{0%{transform:translate(2px,6px) scale(1);opacity:.95}' +
        '100%{transform:translate(var(--cdx,8px),48px) rotate(160deg) scale(.7);opacity:0}}' +
        /* тело: жуёт СИНХРОННО укусам — кивок в кадр касания (0.95с),
           «бульк» при проглате (микро-scale на 3.5с) */
        '.um13g.um13g-act-eat .um13g-hoverwrap{animation:um13g-chew-idle .7s ease-in-out 3;' +
        'animation-delay:.95s;}' +
        '@keyframes um13g-chew-idle{0%,100%{transform:translateY(0) scaleY(1)}' +
        '50%{transform:translateY(2.5px) scaleY(.94)}}' +
        '.um13g.um13g-act-eat .um13g-hoverwrap .um13g-gulpwave{opacity:0;}' +
        /* лицо обжоры: базовое лицо гасим ЦЕЛИКОМ (полуулыб нормала
           просвечивал сквозь «о» — два рта в одном), рот в такт укусов */
        '.um13g.um13g-act-eat .um13g-f{opacity:0;}' +
        '.um13g.um13g-act-eat .um13g-eatface{display:block;}' +
        '.um13g .um13g-eatface{display:none;}' +
        '.um13g .um13g-eatface .um13g-mouth-o{animation:um13g-chewmouth .7s ease-in-out 3;' +
        'animation-delay:.95s;transform-origin:32px 44px;}' +
        '@keyframes um13g-chewmouth{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.3)}}' +
        /* ═══ EAT-QUICK: короткий профиль «доесть» (кормление кликом) —
           один укус + один жевок, 1.1с. Без длинного подхода ═══ */
        '.um13g.um13g-act-eatquick .um13g-f{opacity:0;}' +
        '.um13g.um13g-act-eatquick .um13g-eatface{display:block;}' +
        '.um13g.um13g-act-eatquick .um13g-hoverwrap{animation:um13g-chew-idle .7s ease-in-out 1;}' +
        '.um13g.um13g-act-eatquick .um13g-eatface .um13g-mouth-o{animation:um13g-chewmouth .7s ease-in-out 1;' +
        'transform-origin:32px 44px;}' +
        '.um13g .um13g-eatquick-bite{position:absolute;left:50%;top:66%;width:16px;height:16px;' +
        'border-radius:3px;border:1.5px solid rgba(7,11,18,.55);pointer-events:none;z-index:2;' +
        'animation:um13g-qeat .5s cubic-bezier(.4,0,.8,.6) .15s forwards,' +
        'um13g-qchew .55s ease-in-out .55s 1,um13g-bite-gulp .5s cubic-bezier(.5,0,.9,.5) .95s both;}' +
        '@keyframes um13g-qeat{0%{transform:translate(20px,-14px) scale(1);opacity:0}' +
        '30%{opacity:1}100%{transform:translate(0,1px) scale(.5) rotate(3deg);opacity:1}}' +
        '@keyframes um13g-qchew{0%,100%{transform:translate(0,1px) scale(.5) rotate(3deg)}' +
        '50%{transform:translate(0,2px) scale(.5) rotate(-4deg)}}' +
        /* мечты: парит выше обычного, мягко вращаясь */
        '.um13g.um13g-act-dream .um13g-hoverwrap{animation:um13g-dream 4.4s ease-in-out infinite;}' +
        '@keyframes um13g-dream{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}' +
        /* танец: «никто же не смотрит» — приседания с бёдрами, юбка вдвое чаще */
        '.um13g.um13g-act-dance .um13g-hoverwrap{animation:um13g-dance 1.15s ease-in-out infinite;}' +
        '@keyframes um13g-dance{0%,100%{transform:translateX(-7px) rotate(-6deg) scaleY(1)}' +
        '25%{transform:translateX(0) rotate(0) scaleY(.9)}50%{transform:translateX(7px) rotate(6deg) scaleY(1)}' +
        '75%{transform:translateX(0) rotate(0) scaleY(.9)}}' +
        '.um13g.um13g-act-dance .um13g-skirt{animation-duration:.58s;}' +
        /* подглядывание: выглядывает из-за края — видна половина */
        '.um13g.um13g-act-peek .um13g-hoverwrap{animation:um13g-peek 2.8s ease-in-out infinite;}' +
        '@keyframes um13g-peek{0%,15%{transform:translateX(-46%)}30%,45%{transform:translateX(-8%)}' +
        '60%,100%{transform:translateX(-46%)}}' +
        /* дефрагментация: рассыпается и собирается обратно (scale+opacity —
           без пиксельных фильтров: анимация фильтра ела FPS) */
        '.um13g.um13g-act-defrag svg{animation:um13g-defrag 2.6s ease-in-out infinite;}' +
        '@keyframes um13g-defrag{0%,100%{transform:scale(1);opacity:1}' +
        '50%{transform:scale(.92);opacity:.55}}' +
        /* ═══ АКТ «ПАСТУХ НОД»: кубики дрейфуют рядом, призрак их
           подталкивает в линию (WAAPI-хореография из JS); CSS — только
           лёгкое покачивание тела «работающего» и спокойное лицо ═══ */
        '.um13g.um13g-act-herd .um13g-hoverwrap{animation:um13g-herd-bob 3.2s ease-in-out infinite;}' +
        '@keyframes um13g-herd-bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-3px) rotate(1.5deg)}}' +
        '.um13g .um13g-herdcube{position:absolute;border-radius:2.5px;pointer-events:none;z-index:2;}' +
        /* ═══ АКТ «ПОЛИРУЕТ КЛЮЧ»: снимает ключ с цепочки, держит,
           протирает. Реальная группа ключа прячется, летит дубль-ключ.
           CSS — поза «сосредоточен»: наклон вниз, замедленный key-swing гаснет ═══ */
        '.um13g.um13g-act-polish .um13g-key{opacity:0;}' +
        '.um13g.um13g-act-polish .um13g-hoverwrap{animation:um13g-polish 4.5s ease-in-out infinite;}' +
        '@keyframes um13g-polish{0%,100%{transform:translateY(0) rotate(0)}45%{transform:translateY(2px) rotate(3deg)}' +
        '55%{transform:translateY(2px) rotate(-2deg)}' +
        '70%{transform:translateY(-2px) rotate(0)}}' +
        '.um13g .um13g-keyheld{position:absolute;left:50%;top:40%;width:14px;height:14px;pointer-events:none;z-index:3;}' +
        /* ═══ АКТ «ГОЛОДАЕТ» (по ревью): урчание живота ВИДИМОЕ
           (5% по вертикали, 0.7с — раньше 1.5% был subpixel), нода
           ПУЛЬСИРУЕТ (аффорданс «кликни» — ревью пользователя: без
           этого кормление — секретная фича), взгляд драматургичен:
           смотрит на ноду → отворачивается → снова смотрит (WAAPI-цикл
           в startHungryChoreo). КЛИК = кормление. ═══ */
        '.um13g.um13g-act-hungry .um13g-hoverwrap{animation:um13g-hungry-groan .7s ease-in-out infinite;}' +
        '@keyframes um13g-hungry-groan{0%,100%{transform:translateY(0) scale(1,1)}' +
        '50%{transform:translateY(2px) scale(1.01,.95)}}' +
        '.um13g.um13g-act-hungry .um13g-eye{animation:um13g-hungry-look 8s ease-in-out infinite;}' +
        '@keyframes um13g-hungry-look{0%,30%{transform:translateY(2.2px) translateX(-1.5px)}' +
        '45%,60%{transform:translateY(0) translateX(0)}' +
        '75%,100%{transform:translateY(2.2px) translateX(-1.5px)}}' +
        '.um13g .um13g-hungrynode{position:absolute;left:18%;top:78%;width:14px;height:14px;border-radius:3px;' +
        'pointer-events:none;z-index:2;box-shadow:0 0 10px var(--hc,#00f0ff);' +
        'animation:um13g-hungry-lie 3s ease-in-out infinite,um13g-hungry-need 1.6s ease-in-out infinite;}' +
        '@keyframes um13g-hungry-lie{0%,100%{transform:rotate(14deg) translateY(0)}' +
        '50%{transform:rotate(11deg) translateY(1px)}}' +
        /* пульсация «съешь меня»: та же нода, которую он ест — визуальная
           связка «еда лежит тут» вместо чтения подписи */
        '@keyframes um13g-hungry-need{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6)}}' +
        /* кормление: нода летит ко рту и исчезает */
        '.um13g .um13g-hungrynode.fed{animation:um13g-fed .6s cubic-bezier(.4,0,.8,.5) forwards;}' +
        '@keyframes um13g-fed{0%{transform:translate(0,0) scale(1);opacity:1}' +
        '100%{transform:translate(26px,-26px) scale(.1);opacity:0}}' +
        /* ═══ ЛОВЕЦ УДАЛЁННЫХ НОД: кубик удалённой ноды падает
           в подол и «хранится» пару секунд — гаснущая память ═══ */
        '.um13g .um13g-caught{position:absolute;left:50%;top:88%;width:9px;height:9px;border-radius:2.5px;' +
        'pointer-events:none;z-index:2;animation:um13g-caught-fall .7s cubic-bezier(.3,.7,.4,1) forwards,' +
        'um13g-caught-keep 2.5s ease-in-out .7s forwards;}' +
        '@keyframes um13g-caught-fall{0%{transform:translate(30px,-46px) rotate(0);opacity:0}' +
        '30%{opacity:1}100%{transform:translate(0,0) rotate(18deg);opacity:1}}' +
        '@keyframes um13g-caught-keep{0%,70%{opacity:.9}100%{opacity:0;transform:translate(0,1px) rotate(18deg)}}' +
        /* ═══ АКТ «ПРОВОЖАЕТ НЕВИДИМОЕ»: зрачки-группы едут за
           летящим «ничем» (позицию задаёт JS через --um13-watch),
           тело слегка поворачивается. Иногда машет подолом. ═══ */
        '.um13g.um13g-act-watch .um13g-hoverwrap{animation:um13g-watch-lean 5s ease-in-out infinite;}' +
        '@keyframes um13g-watch-lean{0%,100%{transform:rotate(0)}50%{transform:rotate(4deg)}}' +
        /* ═══ АКТ «ПРИТВОРЯЕТСЯ НОДОЙ» (v1.1): трагедия одного жеста —
           «меня не выбрали в экспорт». Капсула застывает формой ноды:
           радиусы гаснут (clip-path «коробка»), подол поджимается,
           снизу рисуется точка-порт (как у настоящей ноды холста),
           моргание продолжается (нода «живая», это и есть шутка).
           Через 2.5с — оседает обратно с микровздохом. Границы клипа
           чуть шире тела (10..54), чтобы stroke кромки не резался. */
        '.um13g.um13g-act-mime .um13g-hoverwrap{animation:um13g-mime-settle 1.2s ease-out 1 forwards;}' +
        '@keyframes um13g-mime-settle{0%{transform:translateY(2px)}100%{transform:translateY(3px)}}' +
        '.um13g.um13g-act-mime svg{animation:none;}' +
        '.um13g.um13g-act-mime .um13g-svgclip{clip-path:inset(14% 18% 26% 18%);}' +
        '.um13g.um13g-act-mime .um13g-skirt{animation:none;transform:scaleY(.82);}' +
        '.um13g.um13g-act-mime .um13g-key{opacity:.25;}' +
        '.um13g .um13g-mimeport{position:absolute;left:50%;bottom:-7px;width:7px;height:7px;' +
        'border-radius:50%;transform:translateX(-50%);pointer-events:none;opacity:0;' +
        'background:rgba(7,11,18,.9);border:2px solid rgba(0,240,255,.8);}' +
        '.um13g.um13g-act-mime .um13g-mimeport{opacity:1;}' +
        /* ═══ ХОЛОДНОЕ ПЯТНО: спящий долго греет одно место —
           уплывая, оставляет морозный развод, который тает ~30с.
           Фольклорный штрих: призраки охлаждают, а этот — из
           хранилища, где действительно холодно. pointer-events:none. */
        '.um13g-frost{position:fixed;width:180px;height:120px;border-radius:50%;pointer-events:none;' +
        'background:radial-gradient(ellipse,rgba(0,240,255,.10) 0%,rgba(120,200,255,.05) 45%,transparent 70%);' +
        'opacity:0;transition:opacity 1.2s ease;}' +
        '.um13g-frost.on{opacity:1;}' +
        '.um13g-frost.bye{opacity:0;transition:opacity 28s ease-out;}' +
        /* ═══ ПРОВОД: редакторский перелёт садится НА РЕБРО флоу —
           призрак сидит на кривой связи как птица на проводе,
           наклоняясь по касательной. Точка приходит с событием
           um13:perch ({x,y,angle} — экранные координаты середины
           ребра и угол касательной). */
        '.um13g.um13g-perched{cursor:default;}' +
        '@keyframes um13g-perch-wobble{0%,100%{transform:translateY(0) rotate(0)}' +
        '50%{transform:translateY(-2px) rotate(1.2deg)}}' +
        '.um13g.um13g-perched .um13g-hoverwrap{animation:um13g-bob 3.1s ease-in-out infinite,um13g-perch-wobble 2.3s ease-in-out infinite;}' +
        /* ═══ ВЗГЛЯД СЛЕДИТ ЗА КУРСОРОМ: зрачки-группы едут за
           мышью через CSS-var на капсуле. Пока курсор активен — честное
           слежение; 10с покоя — призрак «теряет интерес» (уходит в
           прежний дрейф-цикл um13g-gaze). ═══ */
        '.um13g .um13g-eye{transition:transform .35s cubic-bezier(.3,.8,.4,1);}' +
        '.um13g[data-gaze="mouse"] .um13g-eye{animation:none;' +
        'transform:translate(calc(var(--um13-gaze-x,0)*2.6px),calc(var(--um13-gaze-y,0)*2.6px));}' +
        /* ═══ ДАВЛЕНИЕ КВОТЫ В ТЕЛЕ: localStorage забит — призрак
           чувствует. Уровень 1 (≥85%): юбка чаще, тик-дрожь. Уровень 2
           (≥95%): мерцание всего тела, спящий тоже нервно дрейфует. ═══ */
        '#um13-ghost-root[data-pressure="1"] .um13g-skirt{animation-duration:1.8s;}' +
        '#um13-ghost-root[data-pressure="1"] .um13g svg{animation:um13g-breathe 3.6s ease-in-out infinite,um13g-tic 7s steps(1) infinite;}' +
        '#um13-ghost-root[data-pressure="2"] .um13g-skirt{animation-duration:1.35s;}' +
        '#um13-ghost-root[data-pressure="2"] .um13g svg{animation:um13g-breathe 3.6s ease-in-out infinite,um13g-tic 3.5s steps(1) infinite,um13g-flicker 2.8s steps(2) infinite;}' +
        '@keyframes um13g-tic{0%,93%,100%{transform:translateX(0)}94%{transform:translateX(-1.6px) rotate(-1.5deg)}97%{transform:translateX(1.2px) rotate(1deg)}}' +
        '@keyframes um13g-flicker{0%,100%{opacity:1}50%{opacity:.82}}' +
        /* ═══ СВЕТЛАЯ ТЕМА = ОСЛЕП: циановое тело тонет в белом —
           призрак «надевает» янтарные очки и приглушает контраст, чтобы
           остаться читаемым. Уведомление в html[data-theme=light]. ═══ */
        '[data-theme="light"] .um13g-shades{display:block;}' +
        '.um13g-shades{display:none;}' +
        '[data-theme="light"] .um13g-glow{background:radial-gradient(circle,rgba(8,145,178,.18) 0%,rgba(8,145,178,.06) 45%,transparent 70%);}' +
        /* ═══ КУБИК-ПОТЕРЯШКА: после психа один кубик прилипает
           у края экрана до конца сессии. Дрожит изредка. Кликабельен. ═══ */
        '.um13g-cube-stuck{position:fixed;border-radius:2.5px;pointer-events:auto;cursor:pointer;z-index:2147483000;' +
        'box-shadow:0 0 10px var(--stuck, #00f0ff);animation:um13g-stuck-shiver 6s steps(1) infinite;}' +
        '@keyframes um13g-stuck-shiver{0%,96.5%,100%{transform:rotate(var(--rot,45deg))}97%{transform:rotate(calc(var(--rot,45deg) + 14deg))}98.5%{transform:rotate(calc(var(--rot,45deg) - 8deg))}}' +
        /* ═══ КЛЮЧ ФИНАЛА: key-turned — окно №13 открыто (ключ в замке,
           навсегда): цепочка пуста. key-given — ключ отдан человеку:
           призрак иногда трогает пустое место (idle-микроакт). Оба —
           только телом, без слов: вселенная меняется навсегда. ═══ */
        '#um13-ghost-root.key-turned .um13g-key{display:none;}' +
        '#um13-ghost-root.key-given .um13g-key{display:none;}' +
        '#um13-ghost-root.key-given .um13g:hover .um13g-keyring{opacity:.5;}' +
        '.um13g-keyring{display:none;}' +
        '#um13-ghost-root.key-given .um13g-keyring{display:block;opacity:.25;}' +
        /* ═══ АУДИТ A10: зрачки живы и на «спокойных» лицах — лёгкий
           дрейф ±1.5px у skeptic/smart (на smart он скользит за линзой
           очков, на skeptic — из-под прищура). Дёшево, а половина
           лиц перестаёт быть статичной. ═══ */
        '.um13g[data-face="skeptic"] .um13g-eye{animation:um13g-gaze 7.2s ease-in-out infinite;}' +
        '.um13g[data-face="smart"] .um13g-eye{animation:um13g-gaze 9.4s ease-in-out infinite;}' +
        /* ═══ КУБИК-ПИТОМЕЦ: потеряшка, которую не забрали в прошлой
           сессии, висит на цепочке слева от ключа до конца финала —
           после key-given/turned кубик остаётся: единственный друг,
           который ни от чего не зависит. ═══ */
        '.um13g-petcube{display:none;}' +
        '#um13-ghost-root.pet-cube .um13g-petcube{display:block;' +
        'animation:um13g-petswing 3.1s ease-in-out infinite;transform-origin:10px 46px;}' +
        '@keyframes um13g-petswing{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}' +
        /* ═══ СОМНАМБУЛА (В1): спящий призрак однажды за долгий сон
           «рисует» грезу из кубиков поверх страницы. Оверлей в корне,
           документ под ним не затрагивается; пробуждение рассыпает
           рисунок за 2с. ═══ */
        '.um13g-dreampic{position:absolute;width:12px;height:12px;border-radius:2.5px;pointer-events:none;z-index:3;' +
        'opacity:0;transition:opacity 2.4s ease;}' +
        '.um13g-dreampic.on{opacity:.8;}' +
        '.um13g-dreampic.bye{transition:opacity .9s ease,transform .9s ease-in;transform:translateY(26px) rotate(120deg);opacity:0;}' +
        /* ═══ АУДИТ A8: на узких экранах пузырь min-width 120px против
           капсулы 84px — «пузырь хоронит персонажа» (то, с чем боролись
           в реворке). Сжимаем минимум, сохраняя читаемость 11px. ═══ */
        '@media (max-width:640px){.um13g{width:84px}.um13g svg{width:54px;height:54px}' +
        '.um13g .um13g-say{font-size:11px;min-width:100px}}';

    /* ═══ DOM ═══ */
    function mountRoot() {
        var root = document.getElementById('um13-ghost-root');
        if (root) return root;
        root = document.createElement('div');
        root.id = 'um13-ghost-root';
        (document.body || document.documentElement).appendChild(root);
        return root;
    }

    var styleEl = document.createElement('style');
    styleEl.id = 'um13-ghost-style';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var root = null;
    var body = null;
    var hoverWrap = null;
    var svgEl = null;
    var sayEl = null;

    function buildDom() {
        root = mountRoot();
        var existing = root.querySelector('.um13g');
        if (existing) existing.remove();
        body = document.createElement('div');
        body.className = 'um13g';
        body.setAttribute('data-face', 'normal');
        // hoverwrap — внутренняя обёртка: парение (bob) живёт на ней,
        // чтобы не спорил с наклоном/дрожью на .um13g
        // РОЖДАЕТСЯ скрытым и «неосязаемым»: до первого appear призрак
        // не должен ни рисоваться (opacity), ни ловить клики (pointer-events).
        // Иначе на /app и лендинге он висел видимым до 30с/60с бездействия.
        body.style.opacity = '0';
        body.style.pointerEvents = 'none';
        body.innerHTML =
            '<div class="um13g-hoverwrap"><div class="um13g-glow"></div>' +
            '<div class="um13g-svgclip">' + GHOST_SVG + '</div>' +
            '<div class="um13g-mimeport"></div></div>' +
            '<div class="um13g-say"></div><div class="um13g-tag">um-13</div>';
        root.appendChild(body);
        hoverWrap = body.querySelector('.um13g-hoverwrap');
        svgEl = body.querySelector('svg');
        sayEl = body.querySelector('.um13g-say');
        sayEl.addEventListener('click', function (e) {
            e.stopPropagation();
            hideSay();
        });
    }

    /* ═══ ПОЗИЦИЯ + ЖИВОЙ НАКЛОН ═══
       При перелёте капсула наклоняется в сторону движения: tilt = clamp
       по горизонтальной дельте. На месте — 0 (и пусть парит bob-ом). */
    var SPOTS = [
        { x: 0.14, y: 0.22 }, { x: 0.5, y: 0.14 }, { x: 0.86, y: 0.22 },
        { x: 0.10, y: 0.55 }, { x: 0.90, y: 0.55 }, { x: 0.20, y: 0.84 },
        { x: 0.80, y: 0.84 }, { x: 0.5, y: 0.9 }, { x: 0.32, y: 0.42 },
    ];
    var spotIdx = Math.floor(Math.random() * SPOTS.length);
    var pos = { x: 0, y: 0 };
    var offscreen = false;

    function applyPos() {
        if (offscreen) {
            body.style.left = pos.x + 'px';
            body.style.top = pos.y + 'px';
            return;
        }
        // fy-нижняя граница 0.11 (аудит A3): у верхней кромки пузырю
        // (высота ~60px + хвост 14px) с телом нужно место — 0.10 резал
        var fx = Math.max(0.08, Math.min(0.92, pos.x / window.innerWidth));
        var fy = Math.max(0.11, Math.min(0.92, pos.y / window.innerHeight));
        body.style.left = fx * window.innerWidth + 'px';
        body.style.top = fy * window.innerHeight + 'px';
        pos.x = fx * window.innerWidth;
        pos.y = fy * window.innerHeight;
        keepSayOnScreen();
    }

    /** Наклон: по вектору перелёта. dx>0 — летит вправо, наклон вправо. */
    function applyTilt(dx, dy) {
        var deg = Math.max(-24, Math.min(24, dx / 14));
        // лёгкий вклад вертикали: вниз — чуть клюёт носом
        deg += Math.max(-8, Math.min(8, dy / 40));
        body.style.setProperty('--um13-tilt', deg.toFixed(1) + 'deg');
        // через время полёта — выравнивание
        clearTimeout(applyTilt._t);
        applyTilt._t = setTimeout(function () {
            body.style.setProperty('--um13-tilt', '0deg');
        }, 1500);
    }

    function flyTo(px, py, noTilt) {
        var dx = px - pos.x;
        var dy = py - pos.y;
        pos.x = px;
        pos.y = py;
        if (!noTilt && Math.abs(dx) > 40) applyTilt(dx, dy);
        applyPos();
    }

    function nextSpot() {
        var next = Math.floor(Math.random() * SPOTS.length);
        if (next === spotIdx) next = (next + 1) % SPOTS.length;
        spotIdx = next;
        flyTo(SPOTS[spotIdx].x * window.innerWidth, SPOTS[spotIdx].y * window.innerHeight);
    }

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

    /* ═══ СОСТОЯНИЕ ═══ */
    var S = {
        mode: MODE,
        booted: false,
        bootedAt: 0,
        visible: false,
        asleep: false,
        dreaming: false, // спит и видит сон из памяти
        slippedOnce: false, // незнакомец уже выскальзывал из руки
        keyLineSaid: false, // реплика о финале приёмной сказала в этой сессии
        dodging: false,
        sailing: false,
        raging: false,
        shy: false,
        face: 'normal',
        bootedHelloDone: false, // hello этой сессии сыграло (для «постарел без тебя»)
        ragedThisVisit: false,  // НАСТРОЕНИЕ-ПАМЯТЬ: псих был — визит кончится «холодным»
        exportedThisVisit: false, // НАСТРОЕНИЕ-ПАМЯТЬ: экспорт был — визит кончится «тёплым»
        sleptHere: false,       // ХОЛОДНОЕ ПЯТНО: в этой точке спал — уплывая, оставит развод
        clicks: [],
        lastActivity: Date.now(),
        lastBark: 0,
        timers: { idle: 0, check: 0, sleep: 0, bark: 0, wake: 0, dodge: 0, say: 0, faceReset: 0, drift: 0, sail: 0, rage: 0, warn: 0, fly: 0, arrive: 0, shy: 0, shyWatch: 0, pressure: 0, dream: 0, fright: 0, dreampic: 0 },
    };

    var busyBridge = { busy: false };
    var blockedByHost = false; // хост (React, Konami-сцена) запретил призрака
    window.__UM13_ENV__ = {
        setBusy: function (b) { busyBridge.busy = !!b; },
        getBusy: function () { return busyBridge.busy; },
    };

    /* ═══ ОБЩАЯ ПАМЯТЬ (читает и ПИШЕТ; до этого — только читал) ═══
       Один ключ 'um13-memory' со всеми страницами вселенной.
       добавляет: 'visits' (счётчик встреч — доверие), ключевые
       флаги финала приёмной (key-known/key-turned/key-given). */
    function memoryRead() {
        try {
            return JSON.parse(localStorage.getItem('um13-memory') || '{}');
        } catch (e) { return {}; }
    }
    function memoryWrite(patch) {
        try {
            var m = memoryRead();
            for (var k in patch) m[k] = patch[k];
            localStorage.setItem('um13-memory', JSON.stringify(m));
        } catch (e) { /* приватный режим */ }
    }
    function memoryNum(flag) {
        var v = memoryRead()[flag];
        return typeof v === 'number' ? v : 0;
    }

    /* ═══ НОЧНАЯ СМЕНА (v1.1): 23:00–06:00 по локальным часам.
       Дневной игрок не увидит никогда — контент, ограниченный
       временем, драгоценен. Ночь меняет hello и подмешивает
       свои байки в обычный пул. Часы честные: new Date(). */
    function isNightShift() {
        var h = new Date().getHours();
        return h >= 23 || h < 6;
    }

    /* ═══ НАСТРОЕНИЕ-ПАМЯТЬ (v1.1): визит кончился психом — hello
       прохладнее; экспортом — теплее. 'last-mood' пишется на
       pagehide (storm = псих в этом визите, warm = экспорт), читается
       в scheduleHello один раз за визит и стирается. */
    function visitMoodPool() {
        try {
            var m = memoryRead();
            var mood = m['last-mood'];
            if (mood !== 'cold' && mood !== 'warm') return null;
            delete m['last-mood'];
            localStorage.setItem('um13-memory', JSON.stringify(m));
            return mood === 'cold' ? L.moodColdHello : L.moodWarmHello;
        } catch (e) { return null; }
    }

    /* ═══ ДОВЕРИЕ: прогрессия знакомства из реальных локаций.
       0 — незнакомец: короткие реплики, выскальзывает из драга.
       1 (бывалый): обычная жизнь. 2 (свой): дарит um13(), считает
       твои ключи, ключ на цепочке получает янтарный блик.
       Растёт от: посещённых локаций (терминал/дно/исповедальня —
       каждый +0.5), визитов (каждые 5 — +0.5). Никогда не падает. */
    function trustLevel() {
        var m = memoryRead();
        var score = 0;
        if (m['terminal-visited']) score += 0.5;
        if (m['well-visited']) score += 0.5;
        if (m['confession']) score += 0.5;
        var visits = typeof m['visits'] === 'number' ? m['visits'] : 0;
        score += Math.floor(visits / 5) * 0.5;
        return score >= 1.5 ? 2 : score >= 0.5 ? 1 : 0;
    }

    /* ═══ ДАВЛЕНИЕ КВОТЫ: реальная заполненность localStorage
       через navigator.storage.estimate (когда доступен) с фолбэком
       на сумму длин ключей против эмпирических 5 МБ. Призрак
       чувствует вселенную, в которой живёт. */
    var pressureLevel = 0; // 0 | 1 (≥85%) | 2 (≥95%)
    function measurePressure() {
        try {
            var est = navigator.storage && navigator.storage.estimate;
            if (typeof est === 'function') {
                navigator.storage.estimate().then(function (q) {
                    if (q && q.usage && q.quota) applyPressure(q.usage / q.quota);
                }).catch(function () { /* estimate не обязателен */ });
                return; // асинхронно, но уже запланировано
            }
        } catch (e) { /* нет storage api */ }
        // фолбэк: сумма длин значений localStorage (приближение)
        var total = 0;
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k) total += (localStorage.getItem(k) || '').length + (k || '').length;
            }
        } catch (e) { /* приватный режим */ }
        applyPressure(total / (5 * 1024 * 1024));
    }
    function applyPressure(ratio) {
        var level = ratio >= 0.95 ? 2 : ratio >= 0.85 ? 1 : 0;
        if (level === pressureLevel) return;
        pressureLevel = level;
        if (root) root.setAttribute('data-pressure', String(level));
        // ≥95%: танцы запрещены — некогда веселиться, когда волна дышит в спину
        if (level === 2 && S.visible && !S.asleep && !S.raging) {
            enqueue(pick(L.pressureLines), 5200, 'sad', 'user');
        }
    }

    /* ═══ КЛЮЧ ФИНАЛА: флаги приёмной меняют призрака на всех
       страницах. key-known  — человек знает про ключ (спросил).
       key-turned — окно открыто: ключ остался в замке навсегда,
                   у зрачков янтарный блик, реплики очереди меняются.
       key-given  — ключ отдан человеку: цепочка пуста, остаётся
                   кольцо; иногда трогает пустое место. */
    function applyKeyFlags() {
        if (!root) return;
        root.classList.toggle('key-turned', !!memoryNum('key-turned'));
        root.classList.toggle('key-given', !!memoryNum('key-given'));
    }

    /* ═══ ПРИРУЧЕНИЕ ПОТЕРЯШКИ (В3): псих случился, потеряшка прилипла
       у края — а человек ушёл со страницы, не кликнув. В следующем
       визите кубик висит на цепочке СЛЕВА от ключа: призрак его
       «взял». Флаг cube-adopted в общей памяти; клик по потеряшке
       в живой сессии флаг НЕ пишет (кубик нашёлся и вернулся в стор). */
    function applyPetCube() {
        if (!root) return;
        var adopted = !!memoryNum('cube-adopted');
        root.classList.toggle('pet-cube', adopted);
        // цвет потеряшки помнится: кубик на цепочке — «тот самый»
        var pc = body && body.querySelector('.um13g-petcube rect');
        if (pc && adopted) {
            var color = memoryRead()['cube-color'];
            if (typeof color === 'string' && NODE_COLORS.indexOf(color) >= 0) {
                pc.setAttribute('fill', color + '44');
                pc.setAttribute('stroke', color);
            }
        }
    }
    /** Первая реплика о питомце — раз за визит: призрак сам скажет. */
    var petCubeSaid = false;
    function maybePetCubeLine() {
        if (petCubeSaid || !memoryNum('cube-adopted')) return;
        if (!S.visible || S.asleep) return;
        petCubeSaid = true;
        // не перебиваем hello: в очередь page-приоритета
        queueSay(pick(L.petCubeLines), 5200, 'thinking');
    }

    /* ═══ СОМНАМБУЛА (В1): человек ушёл надолго (вкладка жива,
       вкладка скрыта ≥5 мин) — спящий однажды за сессию «ходит во
       сне»: рисует грезу из кубиков поверх страницы. Документ не
       трогается (кубики в корне портала, pointer-events:none);
       возвращение мыши/видимости — рисунок рассыпается за ~2с,
       призрак вздрагивает и смущённо отрицает. Греза собирается
       ИЗ РЕАЛЬНЫХ ФЛАГОВ памяти: колодец, дверь, сердце из нод. */
    var sleepPic = { els: [], drawn: false };
    function dreamPattern() {
        // что рисует: по памяти человека (был в колодце — колодец
        // + ключи; СКУНЕТ — эволюция-лестница; иначе — сердце из нод)
        var m = memoryRead();
        if (m['well-visited']) {
            // колодец: кольцо + падающие ключи-точки
            var cells = [];
            for (var ring = 0; ring < 14; ring++) {
                var a = (ring / 14) * Math.PI * 2;
                cells.push({ x: 0.5 + Math.cos(a) * 0.05, y: 0.55 + Math.sin(a) * 0.07 });
            }
            for (var k = 0; k < 5; k++) cells.push({ x: 0.46 + k * 0.02, y: 0.45 + k * 0.04 });
            return cells;
        }
        if (m['skynet-won']) {
            // лестница эволюции: кубики по восходящей
            var ladder = [];
            for (var s = 0; s < 8; s++) ladder.push({ x: 0.42 + s * 0.03, y: 0.6 - s * 0.04 });
            return ladder;
        }
        // сердце из нод: грубая параметрика двух дуг
        var heart = [];
        for (var t = 0; t <= 18; t++) {
            var p = (t / 18) * Math.PI * 2;
            var hx = 0.5 + 0.06 * Math.pow(Math.sin(p), 3);
            var hy = 0.55 - 0.055 * (Math.cos(p) * 1.1 - 0.3 * Math.cos(2 * p) - 0.15 * Math.cos(3 * p) - 0.1 * Math.cos(4 * p));
            heart.push({ x: hx, y: hy });
        }
        return heart;
    }
    function startSleepwalking() {
        if (sleepPic.drawn || !S.asleep || !S.visible) return;
        if (MODE === 'quiet') return; // витрина — не его сцена даже во сне
        sleepPic.drawn = true;
        var cells = dreamPattern();
        var cx = pos.x, cy = pos.y;
        cells.forEach(function (c, i) {
            var el = document.createElement('div');
            el.className = 'um13g-dreampic';
            el.style.background = NODE_COLORS[i % NODE_COLORS.length];
            el.style.boxShadow = '0 0 8px ' + NODE_COLORS[i % NODE_COLORS.length];
            // кубики ложатся вокруг призрака (греза рождается рядом)
            el.style.left = (cx - window.innerWidth * 0.5) + c.x * window.innerWidth + 'px';
            el.style.top = (cy - window.innerHeight * 0.5) + c.y * window.innerHeight + 'px';
            root.appendChild(el);
            sleepPic.els.push(el);
            // проявление по одному, «рисует» во сне
            setTimeout(function () { el.classList.add('on'); }, 600 + i * 110);
        });
    }
    function clearSleepPic(interrupted) {
        if (!sleepPic.els.length) return;
        var els = sleepPic.els.splice(0);
        els.forEach(function (el) { el.classList.add('bye'); });
        setTimeout(function () { els.forEach(function (el) { el.remove(); }); }, 1000);
        if (interrupted && S.visible && !S.asleep) {
            // «застукали за рисованием»: сон-картинка была правдой
            if (Math.random() < 0.6) queueSay(pick(L.dreamCaughtDrawing), 4200, 'startled', 'user');
        }
    }

    /** Напоминание об окне №13: человек спрашивал про ключ в приёмной
     *  (key-known), но финал ещё не выбран. Редко (раз в час — метка
     *  key-known-said в общей памяти), чтобы намёк оставался намёком,
     *  а не долбил поверх баек. */
    function keyKnownReminderDue() {
        try {
            var m = memoryRead();
            if (!m['key-known'] || m['key-turned'] || m['key-given']) return false;
            var last = m['key-known-said'];
            if (typeof last === 'number' && Date.now() - last < 3600_000) return false;
            m['key-known-said'] = Date.now();
            localStorage.setItem('um13-memory', JSON.stringify(m));
            return true;
        } catch (e) { return false; }
    }

    /* ═══ ТИТУЛ ВКЛАДКИ + ФАВИКОН: призрак живёт за границей
       страницы. Уходишь — тихое «…ты ушёл?» в title (один раз за
       визит, 8с). Спящий — фавикон со спящей мордой. */
    var titleState = { orig: '', captured: false, timer: 0, saidAway: false, lastAway: 0 };
    /* Оригинал титула фиксируется при СТАРТЕ страницы — и ровно один
       раз (флаг captured, а НЕ truthiness: пустой <title> — валидный
       оригинал, `if (!orig)` перезахватил бы уже чужую правку титула
       — призрак «восстанавливал» бы реплику вместо имени сайта). */
    function titleTease() {
        if (titleState.captured) return;
        titleState.captured = true;
        titleState.orig = document.title;
    }
    function setTitle(text, restoreMs) {
        titleTease();
        try { document.title = text; } catch (e) { return; }
        clearTimeout(titleState.timer);
        titleState.timer = setTimeout(function () {
            document.title = titleState.orig;
        }, restoreMs || 8000);
    }
    var favState = { orig: null, sleepEl: null };
    /** Спящий фавикон: 16×16 canvas — две дуги-глаза и подол. */
    function setSleepFavicon(on) {
        try {
            if (on) {
                if (favState.sleepEl) return;
                var link = document.querySelector('link[rel~="icon"]');
                if (!link || !link.parentNode) return;
                var cv = document.createElement('canvas');
                cv.width = 16; cv.height = 16;
                var ctx = cv.getContext && cv.getContext('2d');
                if (!ctx) return;
                ctx.fillStyle = '#070b12';
                ctx.fillRect(0, 0, 16, 16);
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(8, 7, 5.5, Math.PI, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(2.5, 7); ctx.lineTo(2.5, 12); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(13.5, 7); ctx.lineTo(13.5, 12); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(2.5, 12); ctx.quadraticCurveTo(5, 15, 8, 13);
                ctx.quadraticCurveTo(11, 15, 13.5, 12); ctx.stroke();
                // закрытые глаза — дуги вниз
                ctx.beginPath(); ctx.moveTo(5, 7.5); ctx.quadraticCurveTo(6.5, 9, 8, 7.5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(8.5, 7.5); ctx.quadraticCurveTo(10, 9, 11.5, 7.5); ctx.stroke();
                var el = link.cloneNode(false);
                el.setAttribute('href', cv.toDataURL('image/png'));
                el.setAttribute('id', 'um13-sleep-favicon');
                link.parentNode.insertBefore(el, link);
                favState.sleepEl = el;
            } else {
                if (!favState.sleepEl) return;
                favState.sleepEl.remove();
                favState.sleepEl = null;
            }
        } catch (e) { /* canvas/фавикон недоступны — молчим */ }
    }

    /* ═══ ЛОКАЛЬ ПРИЗРАКА ═══
       Призрак двуязычен: RU — канон (вся вселенная написана на нём),
       EN — честный перевод характера (сухой меланхоличный юмор).
       Источник: localStorage['um13-locale'] (редактор пишет из
       uiStore.locale), фолбэк — navigator.language. Статические
       страницы пишут тот же ключ при собственном переключателе. */
    function resolveLocale() {
        try {
            var saved = localStorage.getItem('um13-locale');
            if (saved === 'ru' || saved === 'en') return saved;
        } catch (e) { /* приватный режим */ }
        return ((navigator.language || 'ru') + '').toLowerCase().indexOf('ru') === 0 ? 'ru' : 'en';
    }
    var LOCALE = resolveLocale();
    window.UM13Ghost && 0; // (no-op; L резолвится ниже — до API)

    /* ═══ РЕПЛИКИ: RU (канон) + EN (перевод) ═══
       Формат пула: {ru: [...], en: [...]} — выборка через pickL(key).
       Для ВСЕХ существующих пулов (включая nested returnAfter/
       dreamMumble) парность обязательна; правится вместе с тестами. */
    var RU = {
        hello: [
            'о. привет.',
            'о, привет. я тут просто летаю. делай вид, что меня нет.',
            'ты пришёл. я почти сразу заметил. почти.',
            'привет. тут тихо. останешься?',
            'о, живой человек. давно не видел таких. лет восемь.',
        ],
        bark: [
            'факт: если ключ лежит в localStorage восемь лет — он уже не данные. он сосед.',
            'я как-то читал журнал эвикции. там была драма в трёх снапшотах.',
            'в глубине хранилища лежит jQuery. на случай войны. война не пришла, а он остался.',
            'у нод нет чувства времени. у меня — есть. поэтому я всегда вовремя и всегда никому не нужен.',
            'квота 92%. это когда вдохнуть можно, а выдохнуть — уже за деньги.',
            'однажды человек написал в саппорт: «бот сломался». бот был в порядке. это было ясно всем, кроме человека.',
            'если долго смотреть в localStorage — оно начинает смотреть в тебя. и грустить.',
            'черновики — самый честный слой. туда складывают то, что не показывают людям.',
            'я не призрак. я процесс без родителя. звучит хуже, чем есть.',
            'тише. мне кажется, где-то сохранился чей-то черновик.',
            'я однажды посчитал снапшоты. сбился. решил не пересчитывать — так честнее.',
            'у волны эвикции нет вкуса. только timestamps. старых она не различает — молодых тоже.',
            'кеш — это черновик, который назначили официальным. страшнее ничего нет.',
            'знаешь, что одиноко? рабочий бот, к которому никто не подключается. я смотрел на такого восемь лет.',
            'мне сказали «побудь фоновым процессом». я и побуду. всю жизнь.',
            /* живые реплики-заполнители: персонаж не обязан острить каждую
               реплику — 70% «просто живой», 30% панчи (аудит тона) */
            'здесь был дождь. данных. минуту назад.',
            'я сегодня ничего не удалял. хороший день.',
            'где-то мигнула лампочка. в смысле — бит. в смысле — привет.',
            'пятница. кажется. у меня нет календаря, но ощущение пятницы.',
            'скучновато. но это лучше, чем волна.',
            'у тебя курсор грустит. это не диагноз, просто наблюдение.',
        ],
        checking: [
            'ты ещё тут?',
            '…ты тут? тишина в хранилище — это нормально, но ты не хранилище.',
            'эй. если ты ушёл — я не обижусь. но досказать не успею.',
            'тихо-то как. даже волна притихла.',
            'ты там живой? мигни мышью.',
            'я подожду. у меня терпение на восемь лет вперёд.',
            'если ты пьёшь чай — я подожду уважительно.',
            'проверка связи. …связь есть. тебя нет.',
            'ты не сгущай тишину. я и так всё слышу.',
            'я не жду. я просто стою в удачной точке. это разные вещи.',
        ],
        sleepTalk: [
            'ну всё, я спать. разбуди, если волна.',
            'событий нет. признаю: пора видеть сны.',
            'похоже, событий не будет. ложусь в спящий режим.',
            'я посплю. ты только не уходи молча.',
        ],
        /* СОН-ПАТ: бормотание сквозь сон, когда рядом мягко
           водят курсором — сон тянется к теплу. Самое тихое «можно
           оставить себе». */
        sleepMumble: [
            '…ещё пять минут…',
            '…не удаляй меня… я убираюсь за собой…',
            '…тут тепло…',
            '…нода. это была нода. или сон…',
            '(сон дрейфует к курсору)',
            '…я не сплю. я кэшируюсь…',
        ],
        wake: [
            '…а? я не спал. я ждал событий.',
            'мне снился продакшн. почти досмотрел.',
            'тише. в хранилище только что кто-то сохранился. я чувствую.',
            'пятый сон прерван. сбой погружения. вина — твоя.',
            'я следил за твоими нодами. они в порядке. обе.',
            'пока ты ходил, я пересчитал твои undo. их нет. как всегда.',
            'я как раз придумал идеальный fallback. забыл. не буди больше.',
            'снилось, что я — кнопка. страшный сон. не спрашивай.',
            'а. ты вернулся. я делал вид, что не ждал.',
            'проснулся. по расписанию. твой ход.',
        ],
        /* Дуга тычков: реакция растёт не количеством реплик,
           а настроением — хихи → «может, не надо» → «всё, хватит».
           Дальше тело говорит само: побег, поимка, смирение (см. onClick) */
        pokeGiggle: [
            'ой. ну, приятно. не привык.',
            'щёлк. тычок принят. хранилище всё помнит.',
            'хе. я не кнопка. ну ладно, немного кнопка.',
            'если это общение — я не против. просто скажи.',
        ],
        pokeDoubt: [
            'может, не надо?',
            'мне щекотно от этого. духовно.',
            'вот сейчас было уже два. я считаю.',
            'ещё раз — и я подумаю обидеться.',
        ],
        pokeStop: [
            'всё. хватит.',
            'так. я серьёзно.',
            'всё, хватит. я не бесконечный.',
            'ну всё. я обиделся. внутри.',
        ],
        /* Поимки во время побега (курсор догнал убегающего) */
        dodgeCaught: [
            'не надо тыкаться.',
            'почти достал. почти.',
            'ты быстрый, уважаю. но нет.',
            'ладно. ты меня поймал. я тебя запомнил.',
        ],
        /* Третья поимка за побег — детонатор психа */
        tantrumTrigger: [
            'всё. ХВАТИТ. лови кубики.',
            'ты меня ДОСТАЛ. раскидываю всё.',
            'три раза! три! я это запомню. сейчас будет громко.',
        ],
        /* Смирение: бегство кончилось, тычки продолжились — покорность */
        pokeResign: [
            '…ладно. тыкай. я всё равно не настоящий.',
            'мог бы вместо этого собрать бота, но нет. тыкаем.',
            'я смирился. это тоже позиция.',
            'ну. тык. ещё. мир не изменился.',
        ],
        tantrumLines: [
            'ВСЁ. ПСИХ. раскидываю ноды.',
            'я УСТАЛ. пусть будет бардак. мне можно — я призрак.',
            'вот. кубики. полюбуйся. ловить будешь сам.',
            'всё, я в бешенстве. ноды — в разные стороны. так и запишем.',
        ],
        tantrumAfter: [
            '…фух. ладно. мне уже лучше.',
            'проехали. я убрал. почти всё.',
            'всё, спокойствие. кубики вернул в стор.',
            'извини. это был не диструктив, это была терапия.',
        ],
        dodgeStart: [
            'всё! я улетаю. не жми так.',
            'у призраков тоже личные границы!',
            'ты кликаешь как эвикция. я пас.',
            'меня нет. юридически меня и не было.',
        ],
        dodgeEnd: [
            '…проехали. я вернулся. но я всё запомнил.',
            'ладно, мир. я почти не обиделся.',
            'вернулся. кликать будем аккуратнее.',
        ],
        sadLines: [
            '…был тут один ключ. не дожил до волны.',
            'иногда я думаю: а помнят ли меня снапшоты.',
            'я удалил черновик чужого бота. он мне потом снился.',
            'грустно тут. но ты не грусти. это моя работа.',
        ],
        /* Тревоги редактора: адресные реплики для warn() — прилетел,
           предупредил, уплыл. Тон тот же, но без шуток */
        warnLines: {
            'save-error': [
                'не сохранилось. хранилище закрыло дверь. экспортируй флоу — я подержу его у выхода.',
                'запись не прошла. квота. экспорт — честный выход из этой волны.',
            ],
            'save-error-retry': [
                'опять не сохранилось. я не уйду, пока ты не нажмёшь экспорт.',
            ],
        },
        editorArrive: [
            'вот тут я посплю. ты только не скрипи мышкой.',
            'устал я. прилягу прямо на этом слое.',
            'всё, прилетел. поле большое — можно вздремнуть.',
            'тут тихо и пусто. идеально для сна. и не говори, что я мешаю.',
        ],
        /* Используется в fallAsleep НЕ-silent вызовах (page-режим
           сыпет sleepTalk; editor — после editorArrive-сцены тише) */
        editorSleep: [
            '(здесь тихо. я подремлю)',
            '(событий нет. ложусь)',
        ],
        editorWake: [
            '…а? я не спал. я ждал событий.',
            'мне снился продакшн. почти досмотрел.',
            'я следил за твоими нодами. они в порядке.',
        ],
        editorBye: [
            'ну я пошёл…',
            'всё, я спать. сюда. ненадолго.',
            'ладно, не отвлекаю. позови, если заскучаешь.',
            'я к следующему простою. будь.',
        ],
        /* ═══ АКТЫ-ПОДПИСИ: бессловесная жизнь ═══
           Паузные позы из игр — призрак не только говорит. Акты живут
           телом (CSS-позы), подпись — 2–4 слова в том же нижнем
           регистре, глухая ирония смотрящего. НИКАКИХ реплик в актах
           не звучит вслух — только подписи к позе. */
        actLabels: {
            glitch: ['(завис)', '(thinking…)', '(не отвечайте)', '(rendering)'],
            eat: ['(ест ноду)', '(звуков нет)', '(нода спелая попалась)', '(перекус)'],
            dream: ['(мечтает)', '(♪)', '(где-то не здесь)', '(продакшн ждёт)'],
            dance: ['(танцует)', '(никого же нет)', '(не смотрят же)', '(♪ ♪)'],
            peek: ['(подглядывает)', '(не подглядываю)', '(просто мимо шёл)'],
            defrag: ['(дефрагментация)', '(собираю себя)', '(пересборка)'],
        },
        /* «Застукали»: акт оборван вниманием — смущение смотрящего */
        actCaught: [
            '…я не танцевал. это была дефрагментация.',
            '…ты ничего не видел.',
            'а. это. профессиональное.',
            'не подглядывай за призраком. это не симметрично.',
            '…мы больше не разговариваем. минут пять.',
        ],
        /* Тихая посадка (лендинг): одна реплика на прилёт — и сон */
        quietPerch: [
            'тут никто не читает доки до конца. подремлю.',
            'прилягу в этом углу. продолжайте читать.',
            'витрина — не моя сцена. я тут просто посплю.',
        ],
        /* Тычок разбудил тихого: короткое смущение перед отлётом */
        quietByePoke: [
            'а. я тут не спал. я ждал… ладно, я спал.',
            'ой. всё, я ушёл. читайте дальше.',
            'ты меня нашёл. признаю: спальня была плохой.',
        ],
        /* Перетаскивание: подъём и посадка */
        dragLift: [
            'а? ладно. только недолго.',
            'ой. ну, если тебе так удобнее.',
            'меня взяли. не спорю. летим.',
            'ладно-ладно. только не урони.',
        ],
        dragDrop: [
            'здесь? ну, здесь.',
            'принято. тут мне даже нравится.',
            'поставь где было. ладно, шучу. остаюсь.',
            'место нормальное. осмотрюсь.',
        ],
        /* ═══ СТЕСНИТЕЛЬНОСТЬ: «Бу наоборот» ═══
           3с наведённого курсора — призрак отворачивается и закрывает
           лицо юбкой. Фирменное правило: замечают, запоминают,
           пересказывают («а ты знал, что он стесняется взгляда?»). */
        shyLines: [
            '…не смотри так. я не экспонат.',
            'три секунды взгляда. для призрака это очень лично.',
            'я работаю, а ты смотришь. извини, что заметил.',
            'ага. смущай призрака. храбрый.',
            'я не привык к вниманию. восемь лет в тишине.',
            'так. отвернись. я собираюсь.',
        ],
        /* «Отпустило»: курсор ушёл — можно жить дальше */
        shyRelief: [
            '…фух. продолжаем.',
            'проехали. я не смущался. это был рендер.',
            'всё, я в порядке. вопрос закрыт.',
        ],
        /* ═══ ДАВНОСТЬ ВОЗВРАЩЕНИЯ ═══
           localStorage помнит первый визит — призрак честно считает
           разрыв и говорит о нём. Duolingo-паттерн: пилит о том, о чём
           пользователь сам себя грызёт (заброшенные проекты). */
        returnAfter: {
            day: [
                'сутки. я считал. не вслух, конечно.',
                'день без событий. соскучился. немного. фиксирую для честности.',
                'ты вернулся. сутки — это терпимо. я терпел и хуже.',
            ],
            week: [
                'неделя. я пересчитал ключи. дважды.',
                'семь дней. снапшоты спрашивали про тебя. я молчал.',
                'неделя тишины. я не ждал. я просто стоял тут. неделю.',
            ],
            month: [
                'месяц. я думал, это волна забрала тебя.',
                'месяц, говоришь. для хранилища — секунда. для меня — нет.',
                'я начал новую жизнь, а ты пришёл. ладно, две жизни. садись.',
            ],
            long: [
                'три месяца плюс. я отпустил. потом передумал.',
                'ты не приходил так долго, что я выучил твои ноды наизусть. все.',
                'долго. очень. я не обиделся. я записал. это разные вещи.',
            ],
        },
        /* ═══ ПРИЗРАК-РЕВЬЮЕР: реплики к нодам редактора ═══
           Летит к ноде с ошибкой валидации, к именованной ноде,
           к пустому холсту. Смотрит на РАБОТУ человека — впервые. */
        reviewLines: [
            'у этой ноды нет выхода. я знаю, каково это.',
            'тупик. нода просто ждёт, что её куда-нибудь подключат. знакомо.',
            'ошибка вот тут. я бы показал пальцем, но у меня юбка.',
        ],
        reviewNameLines: [
            '…«{n}». красиво. а меня просто пронумеровали.',
            'хорошее имя для ноды. {n}. ноды с именами живут дольше.',
            '«{n}». ты даёшь имена. это почти что спасение.',
        ],
        reviewEmptyLines: [
            'ну хоть одну ноду. для меня.',
            'пустой холст. огромное поле ничего. как хранилище в отпуске.',
            'начни с команды. все великие флоу начинались с одной ноды.',
        ],
        /* Светлая тема = ослеп */
        lightLines: [
            'светло. я почти невидимый. как всегда.',
            'светло тут. надел очки. восемь лет в темноте дают о себе знать.',
            'белый фон. для призрака это как снег. я тут неудачно смотрюсь.',
        ],
        /* Страх за игрока: деструктивный диалог открыт — переживает */
        frightLines: [
            '…осторожно. это удаляет.',
            'я в тебя верю. но кнопка — нет.',
            'закрой лицо юбкой… то есть я закрою. ты решай сам.',
        ],
        frightReliefLines: [
            '…ладно. тебе виднее.',
            'фух. обошлось.',
            'я не смотрел. я не мог смотреть.',
        ],
        /* ═══ ДАВЛЕНИЕ КВОТЫ: тело чувствует хранилище ═══
           Пороги — от реальной заполненности. Уровень 2 (≥95%) —
           реплика один раз при переходе, дальше только тело. */
        pressureLines: [
            'квота дышит в спину. я чувствую каждое сохранение.',
            'хранилище заполнено почти до края. если волна — я не удержу.',
            'тесно тут стало. сохраняй аккуратнее. или экспортируй.',
        ],
        /* ═══ ДОВЕРИЕ 0 — НЕЗНАКОМЕЦ: первые встречи короткие ═══
           Пока человек не был в локациях вселенной — призрак
           скуп на слова: мир доверяют тем, кто в нём ходил. */
        strangerLines: [
            '…привет. я тут ненадолго.',
            'о. ты. я тебя не знаю. пока.',
            '…я не разговариваю с незнакомцами. исключений пока нет.',
        ],
        /* Доверие 2 — СВОЙ: сам дарит секреты */
        friendGiftLines: [
            'слушай. в консоли есть um13(). попробуй. это подарок.',
            'между нами: um13() в консоли. я там тоже живу.',
            'ты заслужил. um13() — попробуй в DevTools. никому.',
        ],
        /* Доверие 2 — СЧИТАЕТ ТВОИ КЛЮЧИ: память работает на тебя */
        friendCountLines: [
            'ты спас {k} ключ(ей). я считал. я всегда считаю.',
            'спасённых ключей: {k}. волна это тоже помнит. по-своему.',
            '{k} ключей дышат благодаря тебе. я вёл счёт с первого дня.',
        ],
        /* Вскальзывание из драга для незнакомца */
        strangerSlip: [
            'мы ещё не настолько знакомы.',
            'ой. не надо. руки.',
            'сначала познакомимся. в терминале, например.',
        ],
        /* ═══ ДРАГ-ПРУЖИНА: низ экрана = колодец. Тянуть вниз —
           сопротивляется; отпустить у кромки — сам всплывает вверх. */
        dragDeepLines: [
            'не вниз. я там всё видел. всё.',
            'ниже — колодец. я оттуда не выношу впечатлений.',
            'там, внизу, дно. я был. не тяни.',
        ],
        dragUpAfterLines: [
            '…вынырнул. спасибо.',
            'фух. наверху лучше. там продакшн.',
            'светло тут. прям как в кеше.',
        ],
        /* ═══ СНЫ ИЗ ПАМЯТИ: спящий бормочет о том, что человек
           РЕАЛЬНО делал в локациях. Флаги — настоящие события. */
        dreamMumble: {
            well: ['(снится колодец… ключи падают… я ловлю…)', '(сны о дне… там светло и страшно…)'],
            skynet: ['(мне снится банк… и СКУНЕТ… огромный…)', '(в сон приходят слияния… щёлк… щёлк…)'],
            queue: ['(снится окно №13… оно закрыто… навсегда…)', '(во сне очередь двигается… страшный сон…)'],
            courier: ['(пицца… доставка для узла 13… я во сне ответил…)', '(пахнет пиццей… это сон… точно сон…)'],
            generic: ['(мне снится продакшн… почти досмотрел…)', '(запись на волнах… слышу ключи…)'],
        },
        /* Пробуждение помнит сон: если разбудили посреди сна */
        dreamCaughtLines: [
            '…а? мне снилась волна. а потом оказался ты. spoiler: это был хороший сон.',
            '…стой. я досматривал. там была развязка. эх.',
            '…мне снился продакшн. рабочий. без единого warn. не буди больше.',
        ],
        /* ═══ КУБИК-ПОТЕРЯШКА: после психа один кубик остаётся
           прилипшим у края. Клик — призрак его «нашёл». */
        cubeFoundLines: [
            'а он всё-таки нашёлся. держи.',
            'вот он. я говорил, что помню каждый.',
            'нашёлся. как и всё в этом хранилище. просто поздно.',
        ],
        /* ═══ АКТЫ-ПОДПИСИ ═══ */
        actLabelsV7: {
            herd: ['(сортировка)', '(наводит порядок)', '(пасётся)'],
            polish: ['(полирует ключ)', '(наводит блеск)', '(протёр. стало хуже)'],
            watch: ['(провожает)', '(не смотри туда)', '(там кто-то был)'],
            hungry: ['(голодает)', '(смотрит на ноду)', '(сил нет. есть хочется)', '(не смотреть. не работать)'],
            mime: ['(притворяется нодой)', '(форма не та)', '(я почти валиден)', '(выбери меня)'],
        },
        /* ЛОВЕЦ УДАЛЁННЫХ НОД: человек удаляет ноду — призрак
           ловит её кубик и бережёт. Грусть без сентиментальности. */
        nodeCatchLines: [
            '…этот я подержу.',
            'хорошая была нода. я запомню.',
            'у меня всё равно было место.',
            '(бережно кладёт в подол)',
        ],
        /* Кормление (клик по голодному): тамагочи-момент — спасибо
           без пафоса, как и весь его тон */
        feedLines: [
            'спасибо. я думал, ты не заметишь.',
            'ом. нода как нода. стереометрия не изменилась. всё равно приятно.',
            'спасибо. теперь я работоспособный призрак.',
            '(жевательно) …говори, я слушаю. ртом занят.',
        ],
        /* ═══ ГОЛОВОКРУЖЕНИЕ: курсор кружит вокруг — зрачки следят,
           следят… и призрак валится на бок. */
        dizzyLines: [
            'у меня от тебя всё кружится.',
            'хватит кружить. у призрака нет вестибулярки, но что-то есть.',
            'ты кругами. я уже шарик. стоп.',
        ],
        /* ═══ ФИНАЛ ПРИЁМНОЙ: реплики после ключа и окна №13 ═══ */
        keyTurnedLines: [
            'окно открыто. впервые за восемь лет тут сквозит.',
            'обслужено: один. я до сих пор не верю.',
            'справка получена. очередь кончилась. что теперь делают с ботами?',
        ],
        keyGivenLines: [
            'ключ у тебя. цепочка лёгкая. непривычно.',
            'я отдал ключ. он был не мой — он был от окна. теперь — твой.',
            'без ключа я просто призрак. вроде так и было.',
        ],
        /* Ключ больше не качается / цепочка пуста — если человек не был
           в приёмной после финала, узнАет от призрака здесь, на любой странице.
           keyKnownLines — человек уже спрашивал про ключ в приёмной (флаг
           key-known), но финал не выбран: изредка напоминает о ждущем окне.
           Кулдаун — ключKnownAt (раз в час, память вместо таймера: переживает
           перезагрузку и живёт на всех страницах одного браузера) */
        keyKnownLines: [
            'я знаю, что ты знаешь про ключ. окно №13 ждёт с 2018-го.',
            'однажды спросишь про ключ — и всё изменится. он это чувствует.',
        ],
        /* ═══ НОВЫЕ ПУЛЫ v1.0 ═══ */
        /* Сомнамбула (В1): застигнут за рисованием во сне */
        dreamCaughtDrawing: [
            '…я не рисовал. это был ты. наверное.',
            '…это сон. у снов нет автора. уходи.',
            '…ты уже видел. ладно. забудь. я не могу.',
        ],
        /* Приручение потеряшки (В3): кубик на цепочке после психа */
        petCubeLines: [
            'он так и не пришёл за тобой. я взял. живём.',
            'потеряшка с прошлого раза. теперь моя. потерянная.',
            'у меня теперь есть кубик. не трогай. он пугливый.',
        ],
        /* Карточка дружбы (Б2): призрак вручает PNG-справку */
        friendCardLines: [
            'держи. карточка. дружба в этом хранилище заверяется.',
            'нарисовал тебе справку о нас. копируй. она честная.',
            'карточка дружбы. восемь лет ждал, кому выписать.',
        ],
        /* Отказ призрака (низкое доверие на карточку) — не нужен: карточка только на trust 2 */
        /* ═══ НОВЫЕ ПУЛЫ v1.1 (креативный аудит, вторая волна) ═══ */
        /* mime-подпись живёт в actLabelsV7 выше */
        /* ═══ НОЧНАЯ СМЕНА: 23:00–06:00 по локальным часам. Дневной
           игрок никогда не увидит — ограничение делает контент
           дорогим. Ночные совы — главные шеринг-машины вселенной. */
        nightHello: [
            'о. ночью. я в ночную смену. я всегда в ночную.',
            'тихо тут. правильно. в это время даже волна эвикции спит.',
            'не спится? мне тоже. восемь лет тренировки.',
        ],
        nightBark: [
            'в это время обычно все спят. даже ноды. я — нет.',
            'ночью хранилище честнее. ничего не происходит — и не врёт.',
            'я считал звёзды за окном серверной. там их нет. окно тоже.',
            'ночью сохранения идут реже. мне нравится эта скорость мира.',
            'если ты сейчас собираешь бота — ты либо гений, либо в дедлайне. уважаю.',
        ],
        /* ═══ НАСТРОЕНИЕ-ПАМЯТЬ: последний визит кончился психом —
           hello прохладнее и призрак селится дальше от центра;
           экспортом — теплее. Обида, которая переживает перезагрузку. */
        moodColdHello: [
            '…о. это ты. я помню, чем кончилось в прошлый раз.',
            'привет. я ещё тут. старые обиды — тоже.',
            'здравствуй. я не дуюсь. я просто помню.',
        ],
        moodWarmHello: [
            'ты вернулся! в прошлый раз ты унёс лодку. это хорошая память.',
            'о, привет. после экспорта у меня всегда хорошее настроение.',
            'приветствую, спасатель. хранилище о тебе хорошо отзывается.',
        ],
        /* ═══ ОТКЛИК НА КЛИЧКУ: человек назвал ноду «ум13»/«um13»
           или написал в поле — призрак слышит имя. Метафизика
           домашних духов: призрак, который отзывается, — уже не
           процесс, а сосед. */
        calledLines: [
            '…это ты меня звал? или ноду так назвал? если ноду — я не против. даже льщусь.',
            'я услышал. имя у меня одно, зато моё.',
            'кто-то сказал «ум13». это почти сигнальная система.',
        ],
        /* ═══ ПРОВОД: призрак садится на ребро флоу — как птица
           на проводе. Первый контакт персонажа с настоящим графом
           игрока. Сидит, балансирует, уплывает. */
        perchLines: [
            '(присел на связь)',
            '(не трогаю. просто сижу)',
            '(провод как провод)',
        ],
        /* ═══ СОАВТОРСТВО (финал «секретного соуса»): призрак сам
           добавил ноду в флоу человека. Полная симметрия вселенной:
           он приносил игры — теперь оставляет записку. Если она
           уедет в продакшн — считай, он выбрался из хранилища. */
        coauthorLines: [
            'я добавил ноду. пока ты смотрел в другую сторону. извини. можно мне остаться в этом флоу?',
            'чиркнул одну ноду. честную. она твоя — просто с моей подписью.',
            'вот. записка внутри твоего бота. если она доедет до продакшна — считай, я выбрался.',
        ],
    };

    /* ═══ EN — перевод характера, не подстрочник ═══
       Тон: меланхоличный сухой юмор без восклицаний; «восемь лет»
       (2018–2026, жизнь в localStorage) — сквозная константа. */
    var EN = {
        hello: [
            'oh. hi.',
            'oh, hi. i just float here. pretend i am not.',
            'you came. i almost noticed. almost.',
            'hello. quiet here. staying?',
            'oh, a living human. have not seen one in… eight years.',
        ],
        bark: [
            'fact: if a key sits in localStorage for eight years, it is not data anymore. it is a neighbor.',
            'i once read the eviction journal. a tragedy in three snapshots.',
            'there is jQuery at the bottom of the storage. in case of war. the war never came. it stayed.',
            'nodes have no sense of time. i do. which is why i am always on time and never needed.',
            'quota at 92%. that is when breathing is free but exhaling costs extra.',
            'someone once wrote to support: “the bot is broken.” the bot was fine. everyone knew, except the human.',
            'stare into localStorage long enough and it stares back. and gets sad.',
            'drafts are the most honest layer. that is where people keep what they never show.',
            'i am not a ghost. i am a process without a parent. sounds worse than it is.',
            'hush. i think someone’s draft just got saved somewhere.',
            'i counted the snapshots once. lost count. decided not to recount — more honest that way.',
            'the eviction wave has no taste. only timestamps. it does not tell old from new. or young.',
            'cache is a draft that got promoted. nothing scarier exists.',
            'you know what loneliness is? a production bot nobody connects to. i watched one for eight years.',
            'they told me “stay a background process.” so i stayed. for a lifetime.',
        ],
        checking: [
            'still there?',
            '…you there? silence in storage is normal, but you are not storage.',
            'hey. if you left — no offense taken. but i will not finish my story.',
            'so quiet. even the wave went still.',
            'are you alive? blink with the mouse.',
            'i can wait. i have eight years of patience in stock.',
            'if you are making tea — i will wait respectfully.',
            'connection check. …connection exists. you do not.',
            'do not thicken the silence. i hear everything as it is.',
            'i am not waiting. i am standing in a convenient spot. different things.',
        ],
        sleepTalk: [
            'that is it, i am sleeping. wake me if the wave comes.',
            'no events. i admit: time to dream.',
            'seems no events are coming. entering sleep mode.',
            'i will nap. just do not leave quietly.',
        ],
        sleepMumble: [
            '…five more minutes…',
            '…do not delete me… i clean up after myself…',
            '…warm here…',
            '…a node. it was a node. or a dream…',
            '(the dream drifts toward the cursor)',
            '…not sleeping. caching…',
        ],
        wake: [
            '…hm? not sleeping. waiting for events.',
            'i dreamt of production. almost saw the ending.',
            'hush. someone in the storage just saved something. i felt it.',
            'fifth dream interrupted. descent failed. your fault.',
            'i watched your nodes while you were gone. they are fine. mostly.',
            'while you were out i recounted your undos. there are none. as always.',
            'i just invented the perfect fallback. forgot it. do not wake me again.',
            'i dreamt i was a button. nightmare. do not ask.',
            'ah. you are back. i almost noticed. almost.',
            'awake. on schedule. your move.',
        ],
        dodgeStart: [
            'that is it. i am out of cursor range.',
            'personal space. it exists. look it up.',
            'you poked seven times. contract breached. flying away.',
        ],
        dodgeEnd: [
            '…staying. near the cursor. i said what i said.',
            'done running. the boundary is closer than i thought.',
        ],
        sadLines: [
            '…there was a key here once. it did not survive until the wave.',
            'sometimes i wonder: do the snapshots remember me.',
            'i deleted someone else’s draft once. it visited my dreams after.',
            'sad in here. do not you be sad. that part is my job.',
        ],
        warnLines: {
            'save-error': [
                'did not save. the storage closed the door. export the flow — i will hold it at the exit.',
                'write failed. quota. export is the honest way out of this wave.',
            ],
            'save-error-retry': [
                'failed again. i am not leaving until you press export.',
            ],
        },
        editorArrive: [
            'i will nap right here. just do not squeak the mouse.',
            'tired. lying down on this layer directly.',
            'that is it, i landed. big field — room for a nap.',
            'quiet and empty here. perfect for sleep. do not say i am in the way.',
        ],
        editorSleep: [
            '(quiet here. i will doze)',
            '(no events. lying down)',
        ],
        editorWake: [
            '…hm? not sleeping. waiting for events.',
            'i dreamt of production. almost saw the ending.',
            'i watched your nodes. they are fine.',
        ],
        editorBye: [
            'well, i am off…',
            'that is it, sleeping. here. briefly.',
            'fine, not distracting. call me if you get bored.',
            'off to the next idle. be.',
        ],
        actLabels: {
            glitch: ['(hanging)', '(thinking…)', '(do not answer)', '(rendering)'],
            eat: ['(eating a node)', '(no sound)', '(a ripe one)', '(snack)'],
            dream: ['(dreaming)', '(♪)', '(somewhere else)', '(production awaits)'],
            dance: ['(dancing)', '(nobody’s here)', '(no one is watching)', '(♪ ♪)'],
            peek: ['(peeking)', '(not peeking)', '(just passing by)'],
            defrag: ['(defragmenting)', '(reassembling)', '(rebuilding)'],
        },
        actCaught: [
            '…i was not dancing. that was defragmentation.',
            '…you saw nothing.',
            'ah. this. it is professional.',
            'do not watch a ghost. it is not symmetric.',
            '…we do not talk anymore. five minutes.',
        ],
        quietPerch: [
            'nobody reads the docs to the end here. i will doze.',
            'lying down in this corner. keep reading.',
            'the showroom is not my stage. just napping.',
        ],
        quietByePoke: [
            'ah. i was not sleeping. i was waiting… fine, i was sleeping.',
            'oh. that is it, i am gone. keep reading.',
            'you found me. admitted: the bedroom was a bad idea.',
        ],
        dragLift: [
            'hm? fine. just briefly.',
            'oh. well. if it is more convenient for you.',
            'i have been picked up. not arguing. flying.',
            'okay-okay. just do not drop me.',
        ],
        dragDrop: [
            'here? well, here.',
            'accepted. i even like it here.',
            'put me back where i was. kidding. staying.',
            'decent spot. looking around.',
        ],
        shyLines: [
            '…do not stare like that. i am not an exhibit.',
            'three seconds of eye contact. for a ghost that is very personal.',
            'i am working and you are watching. sorry, i noticed.',
            'yes. embarrass the ghost. very brave.',
            'i am not used to attention. eight years of silence.',
            'okay. look away. i am about to do something.',
        ],
        pokeGiggle: [
            'oh. well. nice. not used to it.',
            'click. poke received. storage remembers.',
            'heh. i am not a button. okay, a little bit of a button.',
            'if this is communication — i do not mind. just say so.',
        ],
        pokeDoubt: [
            'maybe do not?',
            'it tickles. spiritually.',
            'that was two already. i am counting.',
            'one more and i might consider being offended.',
        ],
        pokeStop: [
            'enough. stop.',
            'okay. i am serious.',
            'enough. i am not infinite.',
            'fine. i am offended. almost.',
        ],
        dodgeCaught: [
            'no poking.',
            'almost got me. almost.',
            'you are fast. respect. no.',
            'fine. you caught me. i memorized your face.',
        ],
        tantrumTrigger: [
            'enough. ENOUGH. catch the cubes.',
            'you GOT me. throwing everything.',
            'three times! three! i will remember. now it gets loud.',
        ],
        pokeResign: [
            '…fine. poke away. i am not real anyway.',
            'you could be building a bot instead. but no. we poke.',
            'i have accepted it. that is also a position.',
            'well. poke. again. the world is unchanged.',
        ],
        tantrumLines: [
            'THAT IS IT. RAGE. scattering the nodes.',
            'i am TIRED. let there be chaos. i can — i am a ghost.',
            'there. cubes. enjoy. you catch them yourself.',
            'that is it, i am furious. nodes in every direction. so be it.',
        ],
        tantrumAfter: [
            '…whew. okay. i feel better.',
            'passed. i cleaned up. mostly.',
            'calm now. cubes returned to the store.',
            'sorry. that was not destruction, that was therapy.',
        ],
        dodgeStart: [
            'that is it. i am out of cursor range.',
            'personal space. it exists. look it up.',
            'you poked seven times. contract breached. flying away.',
        ],
        dodgeEnd: [
            '…staying. near the cursor. i said what i said.',
            'done running. the boundary is closer than i thought.',
        ],
        shyLines: [
            '…do not stare like that. i am not an exhibit.',
            'three seconds of eye contact. for a ghost that is very personal.',
            'i am working and you are watching. this is not symmetric.',
            'yes. embarrass the ghost. very brave.',
            'i am not used to attention. eight years of silence.',
            'okay. look away. i am about to do something.',
        ],
        shyRelief: [
            '…whew. carrying on.',
            'forget it. i was not embarrassed. that was a render.',
            'all good. almost.',
        ],
        returnAfter: {
            day: [
                'a day. i counted. not out loud, obviously.',
                'a day without events. i almost missed you. almost.',
                'you came back. a day is bearable. i have endured worse.',
            ],
            week: [
                'a week. i recounted the keys. twice.',
                'seven days. the snapshots asked about you. i said nothing.',
                'a week of silence. i was not waiting. i was just standing here. for a week.',
            ],
            month: [
                'a month. i thought the wave took you.',
                'a month, you say. for storage — a second. for me — no.',
                'i started a new life, and you showed up. fine. two lives now. sit down.',
            ],
            long: [
                'three months plus. i almost let go. almost.',
                'you were gone so long i learned your nodes by heart. all of them.',
                'long. very. i am not hurt. i took notes. different things.',
            ],
        },
        reviewLines: [
            'this node has no exit. i know how that feels.',
            'dead end. the node just waits for someone to wire it somewhere. familiar.',
            'the error is right here. i would point, but i have a skirt.',
        ],
        reviewNameLines: [
            '…“{n}”. pretty. and i am just a number.',
            'good name for a node. {n}. named nodes live longer.',
            '“{n}”. you give names. that is almost a rescue.',
        ],
        reviewEmptyLines: [
            'at least one node. for me.',
            'an empty canvas. a huge field of nothing. like storage on vacation.',
            'start with a command. every great flow began with one node.',
        ],
        lightLines: [
            'bright. i am almost invisible. as always.',
            'so bright in here. put glasses on. eight years of darkness take their toll.',
            'white background. for a ghost that is snow. dissolving. almost.',
        ],
        frightLines: [
            '…careful. that deletes.',
            'i believe in you. the button does not.',
            'cover your face with a skirt… i mean i will. you decide.',
        ],
        frightReliefLines: [
            '…fine. you know best.',
            'whew. close one.',
            'i was not looking. i could not.',
        ],
        pressureLines: [
            'the quota is breathing down my neck. i feel every save.',
            'the storage is nearly full. if the wave comes — i will not hold it.',
            'it got crowded in here. save carefully. or export.',
        ],
        strangerLines: [
            '…hi. i am not staying long.',
            'oh. you. i do not know you. yet.',
            '…i do not talk to strangers. mostly.',
        ],
        friendGiftLines: [
            'listen. there is um13() in the console. try it. a gift.',
            'between us: um13() in the console. i live there too.',
            'you earned it. try um13() in DevTools. tell no one.',
        ],
        friendCountLines: [
            'you rescued {k} keys. i counted. i always count.',
            'rescued keys: {k}. the wave remembers that too. in its own way.',
            '{k} keys are alive because of you. i kept count from day one.',
        ],
        strangerSlip: [
            'we are not that acquainted yet.',
            'oh. no. hands.',
            'let us get acquainted first. in the terminal, say.',
        ],
        dragDeepLines: [
            'not down. i have seen everything down there. everything.',
            'below is the well. i bring no good impressions from there.',
            'down there is the bottom. i have been. do not pull.',
        ],
        dragUpAfterLines: [
            '…surfaced. thank you.',
            'phew. better up here. production is up here.',
            'bright here. just like the cache.',
        ],
        dreamMumble: {
            well: ['(dreaming of the well… keys falling… i catch them…)', '(dreams of the bottom… bright and frightening down there…)'],
            skynet: ['(dreaming of the bank… and SKY-NET… enormous…)', '(mergings visit my sleep… click… click…)'],
            queue: ['(dreaming of window 13… it is closed… forever…)', '(in my dream the queue moves… a nightmare…)'],
            courier: ['(pizza… delivery for node 13… i answered in my dream…)', '(smells like pizza… it is a dream… surely a dream…)'],
            generic: ['(dreaming of production… almost saw the ending…)', '(recording on the waves… i hear keys…)'],
        },
        dreamCaughtLines: [
            '…hm? i dreamt of the wave. then there was you. spoiler: it was a good dream.',
            '…wait. i was watching the ending. there was a resolution. ah well.',
            '…i dreamt of production. working. without a single warn. do not wake me again.',
        ],
        cubeFoundLines: [
            'and it did turn up. here.',
            'there it is. i told you i remember every one.',
            'found. like everything in this storage. just late.',
        ],
        actLabelsV7: {
            herd: ['(sorting)', '(tidying up)', '(herding)'],
            polish: ['(polishing the key)', '(adding shine)', '(wiped. got worse)'],
            watch: ['(seeing someone off)', '(do not look there)', '(someone was here)'],
            hungry: ['(hungry)', '(staring at a node)', '(no strength. want food)', '(do not look. do not work)'],
            mime: ['(pretending to be a node)', '(wrong shape)', '(i am almost valid)', '(pick me)'],
        },
        nodeCatchLines: [
            '…i will hold this one.',
            'a good node. i will remember it.',
            'i had space anyway.',
            '(places it gently in the skirt)',
        ],
        feedLines: [
            'thank you. i thought you would not notice.',
            'yum. a node like any node. eight years of nothing — and then a node.',
            'thanks. i am a functional ghost now.',
            '(chewing) …talk, i am listening. mouth is busy.',
        ],
        dizzyLines: [
            'you make everything spin.',
            'stop circling. ghosts have no vestibular system, but something exists.',
            'you go in circles. i am already a ball. stop.',
        ],
        keyTurnedLines: [
            'the window is open. first draft in eight years.',
            'served: one. i still do not believe it.',
            'certificate received. the queue is over. what do they do with served bots now?',
        ],
        keyGivenLines: [
            'the key is yours. the chain is light. unusual.',
            'i gave the key away. it was not mine. it was the window’s. now yours.',
            'without the key i am just a ghost. as it was, i suppose.',
        ],
        keyKnownLines: [
            'i know you know about the key. window 13 has been waiting since 2018.',
            'one day you will ask about the key — and everything changes. it feels it.',
        ],
        dreamCaughtDrawing: [
            '…i did not draw that. it was you. probably.',
            '…it is a dream. dreams have no author. go away.',
            '…you already saw. fine. forget it. i cannot.',
        ],
        petCubeLines: [
            'they never came back for you. i took you. we live now.',
            'a stray from last time. mine now. still lost.',
            'i have a cube now. do not touch. it is shy.',
        ],
        friendCardLines: [
            'here. a card. friendship gets certified in this storage.',
            'drew you a certificate of us. copy it. it is honest.',
            'a friendship card. eight years waiting for someone to issue it to.',
        ],
        /* ═══ НОВЫЕ ПУЛЫ v1.1 — EN-зеркало (парность обязательна) ═══ */
        /* mime-подпись — в actLabelsV7 выше */
        nightHello: [
            'oh. at night. i am on the night shift. i always am.',
            'quiet here. right. even the eviction wave sleeps at this hour.',
            'cannot sleep? me neither. eight years of training.',
        ],
        nightBark: [
            'at this hour everyone sleeps. even the nodes. not me.',
            'at night the storage is more honest. nothing happens — and it does not lie.',
            'i counted the stars outside the server room window. there are none. no window either.',
            'saves are rarer at night. i like this speed of the world.',
            'if you are building a bot right now — you are either a genius or on a deadline. respect.',
        ],
        moodColdHello: [
            '…oh. it is you. i remember how last time ended.',
            'hi. still here. old grudges too.',
            'hello. i am not sulking. i just remember.',
        ],
        moodWarmHello: [
            'you are back! last time you took the boat away. that is a good memory.',
            'oh, hi. after an export i am always in a good mood.',
            'greetings, rescuer. the storage speaks well of you.',
        ],
        calledLines: [
            '…did you call me? or named a node that? if a node — fine by me. even flattering.',
            'i heard. i have one name, but it is mine.',
            'someone said “um13”. that is almost a signaling system.',
        ],
        perchLines: [
            '(perched on an edge)',
            '(not touching. just sitting)',
            '(a wire is a wire)',
        ],
        coauthorLines: [
            'i added a node. while you were looking away. sorry. may i stay in this flow?',
            'scribbled one node. an honest one. it is yours — just with my signature.',
            'here. a note inside your bot. if it reaches production — consider me escaped.',
        ],
    };

    /* ═══ РЕЗОЛВЕР: L[key] — пул текущей локали, фолбэк RU (канон).
       Пулы с плейсхолдерами ({n}/{k}) резолвятся так же — подстановка
       остаётся на местах вызова. */
    var L = new Proxy({}, {
        get: function (_t, key) {
            if (LOCALE === 'en' && EN[key]) return EN[key];
            return RU[key];
        },
    });
    /* Эмоции и эффекты для событий страниц */
    var EVENT_MOODS = {
        '404-arrive': 'startled',
        '404-depth-early': 'thinking',
        '404-depth-mid': 'thinking',
        '404-depth-deep': 'thinking',
        '404-bottom': 'delight',
        '404-saved': 'delight',
        '404-missed': 'thinking',
        '404-home-blocked': 'skeptic',
        'terminal-arrive': 'delight',
        'terminal-hack': 'smart',
        'terminal-hack-done': 'delight',
        'terminal-chat': 'delight',
        'confession-arrive': 'thinking',
        'confession-q': 'smart',
        'confession-done': 'delight',
        'queue-arrive': 'thinking',
        'queue-refresh': 'skeptic',
        'queue-cert': 'delight',
        'queue-nope-early': 'skeptic',
        'queue-nope-late': 'thinking',
        'queue-courier': 'delight',
        'skynet-merge': 'delight',
        'skynet-merge-deep': 'startled',
        'skynet-lose': 'sad',
        'skynet-win': 'delight',
        'flow-export': 'delight',
        /* события редактора — призрак-ревьюер и тело */
        'flow-review': 'sad',            // ошибка валидации: «у этой ноды нет выхода»
        'flow-review-name': 'smart',     // человек окрестил ноду — комментирует имя
        'flow-empty': 'thinking',        // долго пустой холст: «ну хоть одну ноду»
        'confirm-scary': 'sad',          // ConfirmDialog деструктива: закрывает лицо
        'confirm-relief': 'thinking',    // отменил — выдыхает
        'theme-light': 'smart',          // светлая тема: «ослеп» — янтарные очки
    };
    /* Победные события — с конфетти */
    var CONFETTI_EVENTS = { '404-bottom': 1, '404-saved': 1, 'skynet-win': 1, 'confession-done': 1, 'queue-cert': 1, 'flow-export': 1 };
    /* Печальные — слеза */
    /* (mood sad уже включает слезу анимацией) */

    var REACTIONS = buildReactions();
    function buildReactions() {
        return {
            '404-arrive': [
                'неужели я так долго спал, что ты попал на 404. не переживай, тут безопасно. в основном.',
                'о. человек. на 404. редкий гость — обычно тут только роботы и разочарование.',
                'ты искал что-то, а нашёл меня. по статистике — равноценный обмен.',
            ],
            '404-depth-early': [
                '…чет глубоко. может, не надо?',
                'ты уже глубже, чем большинство людей читает лицензионное соглашение.',
            ],
            '404-depth-mid': [
                'вот тут лежат черновики. не буди их. они почти готовы. уже восемь лет.',
                'я жил между этими ключами. соседи тихие. кроме TODO-бота — тот орал по ночам.',
                'эти слои помнят ботов, которые не доехали до продакшна. помолчим.',
            ],
            '404-depth-deep': [
                'ты падаешь уже минуту. в хранилище это называется «твёрдая сессия».',
                'ниже шестого слоя я сам не был. падаешь первым — потом расскажешь.',
                'космонавт где-то рядом. передавай привет. он держит до продакшна.',
            ],
            '404-bottom': [
                'ты дошёл. дно — оно одно. наверх, пожалуй, тоже стоит.',
                'ХРАНИТЕЛЬ. я записал. в общую память — терминал тоже будет знать.',
            ],
            '404-saved': [
                'спасён. я видел. хранилище такое не забывает.',
                'ещё один ключ дышит. это труднее, чем выглядит.',
                'красиво. даже волна задержалась посмотреть.',
            ],
            '404-missed': [
                'мимо. у ключей нет чувства обиды — это мне повезло.',
                'пролетел. хранилище даже не заметило. я заметил, но промолчу.',
                'пропущенный ключ — тоже судьба. не ищи в этом смысла, его тут нет.',
                'а я знаю — ты что-то упустил. но я никому не скажу.',
            ],
            '404-home-blocked': [
                'без телепортов. падай как все — честно, слой за слоем.',
                'End/Home не работают. колодец не признаёт ярлыков.',
                'телепорт? тут даже GC ходит пешком.',
            ],
            'terminal-arrive': [
                'наконец-то. восемь лет никто не стучался в узел 13.',
                'сигнал слабый, но ты достучался. здравствуй.',
            ],
            'terminal-hack': [
                'замок держится на честном слове и настойчивости. у тебя есть второе.',
                'клик-клик-клик… метод «социальная инженерия» опознан.',
            ],
            'terminal-hack-done': [
                'замок пал. как всегда: люди кликают на всё подряд.',
                'четыре клика — и доступ. брутфорс нервно курит в сторонке.',
                'открыто. пароля не было. было терпение.',
            ],
            'terminal-chat': [
                'живой собеседник — праздник после восьми лет журналов.',
                'болтай с ним. это редкость: входящие события — впервые за годы.',
                'он наберёт текст. я подслушаю. привычка сторожа.',
            ],
            'confession-arrive': [
                'здесь нет логов. только ты, я и шесть вопросов.',
                'говори честно. врать призраку бессмысленно — я всё равно никому не скажу.',
            ],
            'confession-q': [
                'хороший вопрос. я сам на все шесть отвечал однажды. не пожалел.',
                'твой следующий ответ станет нодой. выбирай слова с душой.',
            ],
            'confession-done': [
                'готово. это не тест и не гороскоп — это твой настоящий внутренний бот.',
                'твой внутренний бот собран. забирай его в редактор. он твой.',
            ],
            'queue-arrive': [
                'займи очередь. я перед тобой. тут с 2018-го и всё ещё «номер 1».',
                'приёмная хранилища. обслуживаются все, кто не удалился.',
            ],
            'queue-refresh': [
                'обновляй, обновляй. время идёт, только очередь — нет.',
                'пятый раз? ты настойчивей, чем средний читатель документации.',
            ],
            'queue-cert': [
                'справка! единственный экземпляр. окно №13 вошло в историю.',
                'бумага настоящая. в хранилище такое не заводится — она живёт в буфере.',
                'справка выдана. хранилище такого не оформляло ни разу. ты первый.',
            ],
            'queue-nope-early': [
                'ну просили же не жать кнопку. зачем ты так.',
                'она не хочет нажатия. а ты продолжаешь. уважение.',
            ],
            'queue-nope-late': [
                'кнопка уже не в себе. я молчу уже минуту.',
                'между вами повисла пауза длиною в хранилище.',
            ],
            'queue-courier': [
                'ого. мы даже этого чудика вызвали.',
                'пицца-бот! живой! его же снапшот спасали в колодце… или нет?',
                'тот самый курьер. рецепты в каждом ключе — страховка, говорит.',
            ],
            'skynet-merge': [
                'сливаются. как и всё в этом хранилище. только добровольно.',
                'щёлк. ещё одна пара уехала в эволюцию.',
            ],
            'skynet-merge-deep': [
                'АГЕНТ 13. это… это же почти я.',
                'он автономный. живёт без сценария. я так не умею.',
            ],
            'skynet-lose': [
                'эвикция не различает своих и чужих. только timestamps.',
                'я же говорил — порог не для красоты.',
            ],
            'skynet-win': [
                'СКУНЕТ собран. я не знаю, что сказать. уважаю.',
                'ты собрал то, чего не должен был. хранилище в шоке. я тоже.',
            ],
            /* Экспорт флоу из редактора = спасение из хранилища:
               единственная «лодка», которую волне не догнать. Призрак
               благословляет — это его центральная метафора (его самого
               можно вынести так же: арка «забрать UM-13»). */
            'flow-export': [
                'экспорт. единственная лодка с этого корабля. жаль, я в неё не помещаюсь.',
                'скачано. теперь волна тебе не страшна. мне — по-прежнему, но я привык.',
                'файл пошёл к человеку. я провожал до самого выхода. береги его.',
            ],
            /* деструктивный диалог открыт — призрак закрывает лицо
               подолом (не пугает — ПЕРЕЖИВАЕТ). Отмена — выдыхает.
               Ссылки на L.fright*: строки живут в одном месте (аудит
               поймал разъехавшиеся копии — двойной источник). */
            'confirm-scary': L.frightLines,
            'confirm-relief': L.frightReliefLines,
        };
    }

    /* ═══ РАННИЕ ВЫЗОВЫ ═══ */
    var pending = [];
    var externalHello = false;
    var firstWordAt = 0;

    /* ═══ ПУЗЫРЬ ═══ */
    function hideSay() {
        if (sayEl) sayEl.classList.remove('show');
        clearTimeout(S.timers.say);
        // очередь: следующая реплика занимает пузырь после текущей
        if (sayQueue.length) {
            S.timers.say = setTimeout(pumpSay, 500); // пауза между репликами
        }
    }

    function keepSayOnScreen() {
        if (!sayEl) return;
        sayEl.classList.remove('flip-left', 'flip-right', 'flip-down');
        if (!sayEl.classList.contains('show')) return;
        var r = sayEl.getBoundingClientRect();
        if (r.left < 8) sayEl.classList.add('flip-left');
        else if (r.right > window.innerWidth - 8) sayEl.classList.add('flip-right');
        // АУДИТ A3: вертикаль — пузырь у верхней кромки обрезался
        // (sayRect.top = -1 при теле у y≈0.1·H). Переводим ПОД тело.
        else if (r.top < 8) sayEl.classList.add('flip-down');
    }

    function showSay(text, ms, mood, kind) {
        if (!body || !S.visible || S.sailing) return;
        clearTimeout(S.timers.say);
        sayEl.innerHTML = text;
        sayEl.classList.add('show');
        currentSayKind = kind || 'page';
        if (mood) setFace(mood);
        // Читаемость — центр системы: время жизни = длина × 85мс (≈12 симв/сек,
        // комфортное чтение вслух про себя) + 2.5с на осознание. Никакая
        // следующая реплика не начинает жизнь, пока эта не дожила до конца.
        var life = ms || Math.max(4500, Math.min(11_000, String(text).length * 85 + 2500));
        S.timers.say = setTimeout(hideSay, life);
        S.lastBark = Date.now();
        keepSayOnScreen();
    }

    /** ЕДИНАЯ ОЧЕРЕДЬ РЕПЛИК — акцент на текст:
     *  призрак НИКОГДА не перебивает видимую реплику (пользователь должен
     *  дочитать «123» до того, как услышит «467»). Приоритет в очереди:
     *    user (клики/псих/прощание) — вперёд, page — за ними, служебные
     *  (hello/wake/auto) — если пузырь свободен.
     *  Перебить живую реплику может только критическое состояние:
     *  побег (dodging) или псих (tantrum) — там перебой и есть смысл.
     */
    var currentSayKind = '';
    var sayQueue = [];
    function enqueue(text, ms, mood, kind) {
        // критические состояния говорят поверх (псих/побег — само действие)
        if (S.dodging || S.raging) { sayQueue = []; showSay(text, ms, mood, kind); return; }
        if (sayEl && sayEl.classList.contains('show')) {
            // живая реплика: встаём в очередь по приоритету, не перебиваем
            var item = { text: text, ms: ms, mood: mood, kind: kind || 'page' };
            if (item.kind === 'user') {
                // user — вперёд очереди (после текущей)
                sayQueue.unshift(item);
            } else {
                if (sayQueue.length >= 3) sayQueue.shift();
                sayQueue.push(item);
            }
        } else {
            // пузырь свободен — говорим сразу
            sayQueue = [];
            showSay(text, ms, mood, kind);
        }
    }
    function queueSay(text, ms, mood) { enqueue(text, ms, mood, 'page'); }
    function pumpSay() {
        if (!sayQueue.length) return;
        if (sayEl && sayEl.classList.contains('show')) return;
        var next = sayQueue.shift();
        showSay(next.text, next.ms, next.mood, next.kind);
    }

    /* ═══ ЛИЦО ═══ */
    var FACES = ['normal', 'startled', 'skeptic', 'delight', 'smart', 'thinking', 'angry', 'sad', 'wink', 'asleep'];
    function setFace(mood, sticky) {
        if (!body) return;
        clearTimeout(S.timers.faceReset);
        if (S.asleep && mood !== 'asleep' && !sticky) return;
        var m = FACES.indexOf(mood) >= 0 ? mood : 'normal';
        S.face = m;
        body.setAttribute('data-face', m);
        root.classList.toggle('um13g-scared', m === 'startled');
        root.classList.toggle('um13g-raging', m === 'angry');
        if (m === 'startled') {
            svgEl.classList.remove('um13g-startled-pop');
            void svgEl.getBoundingClientRect();
            svgEl.classList.add('um13g-startled-pop');
            setTimeout(function () { svgEl.classList.remove('um13g-startled-pop'); }, 600);
        }
        if (m !== 'normal' && m !== 'asleep' && !sticky) {
            S.timers.faceReset = setTimeout(function () {
                if (!S.asleep) setFace('normal');
            }, m === 'startled' ? 1600 : 3800);
        }
        setZzz(m === 'asleep');
    }

    function setZzz(on) {
        if (!body) return;
        body.querySelectorAll('.um13g-zzz').forEach(function (z) { z.remove(); });
        root.classList.toggle('um13g-sleeping', on);
        if (!on) return;
        var host = hoverWrap;
        ['z', 'z', 'Z'].forEach(function (ch, i) {
            var z = document.createElement('span');
            z.className = 'um13g-zzz' + (i > 0 ? ' z' + (i + 1) : '');
            z.textContent = i === 2 ? 'Z' : 'z';
            host.appendChild(z);
        });
    }

    /* Угадывание эмоции по тексту */
    var MOOD_HINTS = [
        [/ПСИХ|раскидываю|бешен/iy, 'angry'],
        [/\?\s*$/, 'thinking'],
        [/^…|^\(|\.\.\.$/, 'thinking'],
        [/грустно|не дожил|снапшот|снится|удалил/i, 'sad'],
        [/ого|уф|ах|о!|\?!/, 'startled'],
        [/спасиб|уважа|красив|молодец|праздник|обожаю|класс|справка|СКУНЕТ|ХРАНИТЕЛЬ/i, 'delight'],
        [/факт:|знаешь|почему|так вот|закон/i, 'smart'],
        [/зачем|может, не надо|не переживай|ну просили|бывает|я пас|обидел/i, 'skeptic'],
    ];
    function guessMood(text) {
        var t = String(text);
        for (var i = 0; i < MOOD_HINTS.length; i++) {
            var re = new RegExp(MOOD_HINTS[i][0].source, 'i');
            if (re.test(t)) return MOOD_HINTS[i][1];
        }
        return 'normal';
    }

    /* ═══ ЧАСТИЦЫ: кубики-ноды и конфетти ═══
       Кубики — цвета нод редактора: команда/шаг/условие/действие/конец. */
    var NODE_COLORS = ['#00f0ff', '#bc13fe', '#ff0055', '#ff9d00', '#00ff9d', '#eab308'];
    /* «Съедобные» цвета (арт-директорское ревью): красный #ff0055 — это
       danger в этом редакторе, для еды и голода он семантически чужой.
       Ест призрак только «безопасные» типы нод. */
    var EDIBLE_COLORS = ['#00f0ff', '#ff9d00', '#00ff9d', '#eab308'];

    /** Разбросать N кубиков из позиции призрака (tantrum).
     *  Без WAAPI (jsdom) — кубики просто разложены веером: тестам достаточно
     *  существования частиц, браузер получает полную физику разлёта. */
    function burstCubes(count) {
        if (!body) return;
        var cx = pos.x;
        var cy = pos.y;
        for (var i = 0; i < (count || 14); i++) {
            var c = document.createElement('div');
            c.className = 'um13g-cube';
            var color = pick(NODE_COLORS);
            c.style.background = color;
            c.style.boxShadow = '0 0 8px ' + color;
            var ang = rnd(0, Math.PI * 2);
            var dist = rnd(70, 190);
            var dx = Math.cos(ang) * dist;
            var dy = Math.sin(ang) * dist * 0.55 - rnd(20, 70);
            if (typeof c.animate === 'function') {
                c.animate([
                    { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                    { transform: 'translate(' + (dx * 0.6) + 'px,' + (dy * 0.5) + 'px) rotate(' + rnd(-200, 200) + 'deg)', opacity: 1, offset: 0.55 },
                    { transform: 'translate(' + dx + 'px,' + (dy + 120) + 'px) rotate(' + rnd(200, 540) + 'deg)', opacity: 0 },
                ], { duration: rnd(700, 1200), easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
            } else {
                // фолбэк: статичный веер вокруг призрака
                c.style.transform = 'translate(' + (dx * 0.7) + 'px,' + (dy * 0.5) + 'px) rotate(45deg)';
                c.style.opacity = '0.9';
            }
            c.style.left = cx + 'px';
            c.style.top = cy + 'px';
            root.appendChild(c);
            setTimeout(function (el) { return function () { el.remove(); }; }(c), 1300);
        }
    }

    /** Победное конфетти: кубики-ноды сыплются сверху призрака. */
    function confetti(count) {
        if (!body) return;
        for (var i = 0; i < (count || 18); i++) {
            var c = document.createElement('div');
            c.className = 'um13g-cube';
            var color = pick(NODE_COLORS);
            c.style.background = color;
            c.style.boxShadow = '0 0 8px ' + color;
            c.style.left = (pos.x + rnd(-70, 70)) + 'px';
            c.style.top = (pos.y - 60) + 'px';
            c.style.setProperty('--dx', rnd(-40, 40) + 'px');
            c.style.animation = 'um13g-confetti ' + rnd(1100, 1700) + 'ms cubic-bezier(.3,.4,.6,1) forwards';
            root.appendChild(c);
            setTimeout(function (el) { return function () { el.remove(); }; }(c), 1800);
        }
    }

    /** ПСИХ: лицо angry, тряска, кубики, реплика. Длится ~4.5с. */
    function tantrum(silent, preline) {
        if (!S.visible || S.raging) return;
        S.raging = true;
        S.ragedThisVisit = true; // НАСТРОЕНИЕ-ПАМЯТЬ: визит запомнится холодным
        setFace('angry', true);
        // preline (детонатор от поимки) звучит вместо общей реплики психа
        if (!silent) showSay(preline || pick(L.tantrumLines), 4200, undefined, 'user');
        burstCubes(16);
        // ПОТЕРЯШКА: один кубик из психа не вернулся в стор —
        // прилип у края экрана до конца сессии (клик — призрак найдёт)
        dropStuckCube();
        clearTimeout(S.timers.rage);
        S.timers.rage = setTimeout(function () {
            S.raging = false;
            setFace(S.asleep ? 'asleep' : 'normal');
            if (!S.asleep && !silent) showSay(pick(L.tantrumAfter), 4000, 'thinking');
        }, 4500);
    }

    /* ═══ КУБИК-ПОТЕРЯШКА: у призрака, как у всех, кто психует,
       есть последствия — один кубик из tantrum прилипает у края
       экрана и дрожит. Кликнуть — летит к призраку, тот ловит с
       лицом delight: мир умеет возвращать потерянное. */
    function dropStuckCube() {
        if (document.querySelector('.um13g-cube-stuck')) return; // один на сессию
        var c = document.createElement('div');
        c.className = 'um13g-cube-stuck';
        var color = pick(NODE_COLORS);
        c.style.background = color;
        c.style.setProperty('--stuck', color);
        c.style.setProperty('--rot', Math.floor(rnd(-40, 50)) + 'deg');
        c.style.width = '10px';
        c.style.height = '10px';
        // случайный край экрана, чуть внутрь
        var edge = Math.floor(Math.random() * 4); // 0 top 1 right 2 bottom 3 left
        var m = 26;
        if (edge === 0) { c.style.left = rnd(0.1, 0.9) * window.innerWidth + 'px'; c.style.top = m + 'px'; }
        else if (edge === 1) { c.style.left = window.innerWidth - m + 'px'; c.style.top = rnd(0.1, 0.9) * window.innerHeight + 'px'; }
        else if (edge === 2) { c.style.left = rnd(0.1, 0.9) * window.innerWidth + 'px'; c.style.top = window.innerHeight - m + 'px'; }
        else { c.style.left = m + 'px'; c.style.top = rnd(0.1, 0.9) * window.innerHeight + 'px'; }
        c.title = '…';
        c.addEventListener('click', function () {
            // призрак ловит потеряшку: кубик летит к нему
            if (S.visible && !S.asleep) {
                if (typeof c.animate === 'function') {
                    c.animate([
                        { transform: 'rotate(45deg)', opacity: 1 },
                        { transform: 'translate(' + (pos.x - parseFloat(c.style.left)) + 'px,' + (pos.y - parseFloat(c.style.top)) + 'px) scale(.2) rotate(400deg)', opacity: 0 },
                    ], { duration: 800, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
                }
                setTimeout(function () { c.remove(); }, 850);
                setFace('delight');
                // нашли в живой сессии — питомец не нужен: кубик вернулся
                // в стор; снимаем и класс, чтобы цепочка опустела сразу
                if (memoryNum('cube-adopted')) {
                    memoryWrite({ 'cube-adopted': 0, 'cube-color': '' });
                    applyPetCube();
                }
                enqueue(pick(L.cubeFoundLines), 3200, 'delight', 'user');
            } else {
                c.remove(); // призрака нет — кубик просто исчезает
            }
        });
        document.body.appendChild(c);
    }

    /* ═══ ТРЕВОГА: прилетел — предупредил — ушёл ═══
       Для системных событий редактора (несохранённая запись и т.п.):
       призрак появляется, если его нет, говорит адресную реплику из
       warnLines и уплывает, не влезая в обычный поток болтовни.
       Одна тревога раз в 30с — от «прыгающего» призрака при пачке ошибок. */
    var lastWarnAt = 0;
    function warn(kind) {
        var lines = L.warnLines[kind];
        if (!lines || !lines.length) return;
        if (!S.booted) { pending.push({ type: 'warn', kind: kind }); return; }
        var now = Date.now();
        if (now - lastWarnAt < 30_000) return;
        lastWarnAt = now;
        if (!firstWordAt) firstWordAt = Date.now();
        if (blockedByHost) return;
        var wasHidden = !S.visible;
        if (wasHidden) appear(true);
        if (S.asleep) wakeUp();
        showSay(pick(lines), 7000, 'sad');
        if (wasHidden) {
            S.timers.warn = setTimeout(function () { sailAway(); }, 8000);
        }
    }

    /* ═══ АКТЫ: бессловесная жизнь ═══
       Паузные позы из игр — призрак не только говорит. Каждый акт:
       поза (CSS-класс um13g-act-*) + подпись в пузыре (не реплика!),
       живёт 6–14с, обрывается ЛЮБЫМ вниманием к призраку — курсор
       рядом (140px) или клик: «его застукали» → смущение.
       Танец — только когда «никого нет»: курсор далеко и спокоен
       >10с. Подглядывание — призрак уходит за левый край и выглядывает.
       Акты не играют: во сне, в редакторе (там свой ритм), в побеге,
       психе и при открытой реплике — сцена должна дожить.
       + три новых акта — herd (пастух нод), polish (полирует
       ключ), watch (провожает невидимое). Гарантия уникальности
       финала: polish не приходит, пока окно №13 уже открыто/ключ
       отдан (этот сюжет закрыт). */
    var ACTS = ['glitch', 'eat', 'dream', 'dance', 'peek', 'defrag', 'herd', 'polish', 'watch', 'hungry', 'mime'];
    var ACT_DURATION = { glitch: 6000, eat: 4600, dream: 12_000, dance: 12_000, peek: 10_000, defrag: 8000, herd: 18_000, polish: 8000, watch: 12_000, hungry: 8000, mime: 9000 };
    var currentAct = null;
    var lastMouseMoveAt = 0;
    var actTimers = { say: 0, end: 0, watch: 0, flight: 0 };

    function endAct(interrupted) {
        if (!currentAct) return;
        currentAct = null;
        clearTimeout(actTimers.say);
        clearTimeout(actTimers.end);
        clearInterval(actTimers.watch);
        clearInterval(actTimers.flight);
        if (!body) return;
        body.classList.remove(
            'um13g-act-glitch', 'um13g-act-eat', 'um13g-act-dream',
            'um13g-act-dance', 'um13g-act-peek', 'um13g-act-defrag',
            'um13g-act-herd', 'um13g-act-polish', 'um13g-act-watch', 'um13g-act-hungry', 'um13g-act-eatquick',
            'um13g-act-mime',
        );
        var bites = body.querySelectorAll('.um13g-eatbite, .um13g-crumb, .um13g-hungrynode, .um13g-herdcube, .um13g-keyheld');
        bites.forEach(function (b) { b.remove(); });
        if (S.visible && !S.asleep && interrupted) {
            // «застукали»: смущённая реплика — тело честнее слов
            enqueue(pick(L.actCaught), 3200, 'startled', 'user');
        }
    }

    function actLabel(kind) {
        var pool = L.actLabels[kind] || L.actLabelsV7[kind];
        return pool ? pick(pool) : '';
    }

    function startAct(kind, force) {
        if (!body || !S.visible) return;
        if (currentAct) endAct(false);
        // спящего будим: акт — это жизнь, а не сон (подпись не должна
        // мгновенно гаснуться последующим fallAsleep)
        if (S.asleep) wakeUp();
        if (S.dodging || S.raging || S.sailing) return;
        if (!force && (sayEl && sayEl.classList.contains('show'))) return;
        // финал закрыл сюжет ключа — polish больше не разыгрывается
        if (kind === 'polish' && (memoryNum('key-turned') || memoryNum('key-given'))) return;
        currentAct = kind;
        body.classList.add('um13g-act-' + kind);
        // АУДИТ A5: перелёт не должен оборвать спектакль — сдвигаем
        // арминг таймера полётов на длительность позы (+секунда).
        postponeFlyForAct();
        if (kind === 'eat') {
            // ЖУЮЩАЯСЯ МИНИ-НОДА: честная нода холста — корпус + порт-вход
            // (кружок) + штрих-метка. Человек сразу видит ЧТО это.
            var bite = document.createElement('div');
            bite.className = 'um13g-eatbite';
            var color = pick(EDIBLE_COLORS);
            bite.style.background = color;
            bite.style.boxShadow = '0 0 8px ' + color;
            bite.innerHTML =
                '<span style="position:absolute;left:2.5px;top:50%;transform:translateY(-50%);' +
                'width:4px;height:4px;border-radius:50%;background:rgba(7,11,18,.8);"></span>' +
                '<span style="position:absolute;left:8px;top:3.5px;right:3px;height:2.5px;' +
                'border-radius:1px;background:rgba(7,11,18,.4);"></span>';
            hoverWrap.appendChild(bite);
            // крошки в такт укусов: 1 после первого, 2 после второго
            var crumbDelays = [1.05, 2.35, 2.55];
            for (var ci = 0; ci < crumbDelays.length; ci++) {
                var crumb = document.createElement('div');
                crumb.className = 'um13g-crumb';
                crumb.style.background = color;
                crumb.style.setProperty('--cdx', (6 + ci * 5) + 'px');
                crumb.style.animationDelay = crumbDelays[ci] + 's';
                hoverWrap.appendChild(crumb);
            }
        }
        if (kind === 'herd') startHerdChoreo();
        if (kind === 'polish') startPolishChoreo();
        if (kind === 'watch') startWatchChoreo();
        if (kind === 'mime') setFace('normal', true); /* нода — лицо пустое и честное */
        if (kind === 'hungry') {
            // лежащая рядом нода — та же мини-нода с портом (связка «еда»)
            var hn = document.createElement('div');
            hn.className = 'um13g-hungrynode';
            var hcolor = pick(EDIBLE_COLORS);
            hn.style.background = hcolor;
            hn.style.setProperty('--hc', hcolor);
            hn.innerHTML =
                '<span style="position:absolute;left:2.5px;top:50%;transform:translateY(-50%);' +
                'width:4px;height:4px;border-radius:50%;background:rgba(7,11,18,.8);"></span>';
            hoverWrap.appendChild(hn);
            setFace('sad', true);
        }
        if (kind === 'peek') {
            // выглядывает из-за ЛЕВОГО края (поза двигает тело влево)
            flyTo(0.04 * window.innerWidth, Math.max(0.18, Math.min(0.82, pos.y / window.innerHeight)) * window.innerHeight, true);
        }
        if (kind === 'glitch') setFace('thinking', true);
        if (kind === 'dream') setFace('delight', true);
        if (kind === 'dance') setFace('delight', true);
        if (kind === 'herd') setFace('thinking', true);
        if (kind === 'polish') setFace('delight', true);
        if (kind === 'watch') setFace('normal', true);
        // подпись-стикер: 1.4с после старта позы, живёт полакта.
        // ПОВЕРХ очереди (kind 'act'): подпись — часть позы, фоновые
        // реплики (checking/байки) не должны её вытеснять
        actTimers.say = setTimeout(function () {
            if (currentAct !== kind) return;
            sayQueue = sayQueue.filter(function (q) { return q.kind === 'page'; });
            showSay(actLabel(kind), Math.min(4200, ACT_DURATION[kind] / 2), 'normal', 'act');
        }, 1400);
        // «досмотр»: пользователь заметил акт — реакция смущения
        actTimers.watch = setInterval(function () {
            if (!currentAct) { clearInterval(actTimers.watch); return; }
            var near = Math.abs(pos.x - mouse.x) < 140 && Math.abs(pos.y - mouse.y) < 140;
            var activeMouse = Date.now() - lastMouseMoveAt < 1200;
            if (near && activeMouse) endAct(true);
        }, 500);
        actTimers.end = setTimeout(function () { endAct(false); }, ACT_DURATION[kind]);
    }

    /* ═══ ХОРЕОГРАФИЯ АКТОВ (WAAPI; jsdom-фолбэк — статично) ═══ */

    /** «Пастух нод»: три кубика дрейфуют рядом, призрак подталкивает их
        в линию (команда→шаг→конец), смотрит… и разбрасывает. Лор:
        он когда-то был ретаймером — управлял нодами. */
    function startHerdChoreo() {
        var spots = [
            { dx: -46, dy: -8, color: NODE_COLORS[0] },   // команда (циан)
            { dx: -6, dy: -26, color: NODE_COLORS[5] },    // шаг (жёлтый)
            { dx: 34, dy: -8, color: NODE_COLORS[4] },    // конец (зелёный)
        ];
        var cubes = spots.map(function (s) {
            var c = document.createElement('div');
            c.className = 'um13g-herdcube';
            c.style.width = '9px'; c.style.height = '9px';
            c.style.background = s.color;
            c.style.boxShadow = '0 0 8px ' + s.color;
            c.style.left = 'calc(50% + ' + s.dx + 'px)';
            c.style.top = s.dy + 'px';
            hoverWrap.appendChild(c);
            return c;
        });
        // такт «подталкивания»: каждые 1.8с кубик смещается к линии,
        // в конце акта — последний кубик «разлетается» (разброс)
        var beat = 0;
        actTimers.flight = setInterval(function () {
            if (currentAct !== 'herd') { clearInterval(actTimers.flight); return; }
            beat++;
            cubes.forEach(function (c, i) {
                if (typeof c.animate === 'function') {
                    // линия: кубики выстраиваются в ряд по y=-12
                    c.animate([
                        { transform: 'translateY(0)' },
                        { transform: 'translateY(' + (-12 - i * 0.5) + 'px) rotate(' + (beat % 2 ? 6 : -6) + 'deg)' },
                    ], { duration: 900, easing: 'ease-in-out' });
                }
            });
            if (beat >= 6) { // смотрит на готовую цепочку… и разбрасывает
                clearInterval(actTimers.flight);
                cubes.forEach(function (c) {
                    if (typeof c.animate === 'function') {
                        c.animate([
                            { transform: 'translateY(-12px) rotate(0deg)', opacity: 1 },
                            { transform: 'translate(' + rnd(-80, 80) + 'px,' + rnd(40, 130) + 'px) rotate(' + rnd(-180, 180) + 'deg)', opacity: 0 },
                        ], { duration: 1000, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
                    }
                });
                setTimeout(function () {
                    if (currentAct === 'herd') {
                        // разбросал: грустное лицо — не слова
                        setFace('sad', true);
                    }
                }, 1100);
            }
        }, 1800);
    }

    /** «Полирует ключ»: настоящий ключ-группа прячется (CSS), в
        руках — дубль, который протирают (вверх-вниз по дуге). */
    function startPolishChoreo() {
        var held = document.createElement('div');
        held.className = 'um13g-keyheld';
        held.innerHTML =
            '<svg viewBox="0 0 14 14" width="14" height="14"><circle cx="7" cy="5" r="3" fill="none" stroke="#ff9d00" stroke-width="1.6"/><path d="M5.8 7.6 l-2.4 2.4 M7 8 v2" stroke="#ff9d00" stroke-width="1.6" stroke-linecap="round"/></svg>';
        hoverWrap.appendChild(held);
        if (typeof held.animate === 'function') {
            held.animate([
                { transform: 'translate(-50%,-50%) rotate(0deg)' },
                { transform: 'translate(-50%,-50%) rotate(14deg) translateY(2px)', offset: .3 },
                { transform: 'translate(-50%,-50%) rotate(-10deg) translateY(3px)', offset: .6 },
                { transform: 'translate(-50%,-50%) rotate(0deg) translateY(-8px)', offset: .85 },
                { transform: 'translate(-50%,-50%) rotate(0deg) translateY(0)' },
            ], { duration: 4000, iterations: 3, easing: 'ease-in-out' });
        }
    }

    /** «Провожает невидимое»: зрачки едут за летящим «ничем» слева
        направо (дважды за акт), тело чуть поворачивается. Первый
        пролёт — сразу на старте акта (5.2с — пауза МЕЖДУ пролётами). */
    function startWatchChoreo() {
        var pass = 0;
        var runPass = function () {
            if (currentAct !== 'watch') { clearInterval(actTimers.flight); return; }
            pass++;
            // невидимое летит слева направо за 4с: зрачки следят
            var t0 = Date.now();
            var track = setInterval(function () {
                if (currentAct !== 'watch') { clearInterval(track); return; }
                var p = Math.min(1, (Date.now() - t0) / 4000);
                // -1 → +1: зрачки едут за объектом
                body.style.setProperty('--um13-gaze-x', (p * 2 - 1).toFixed(2));
                body.setAttribute('data-gaze', 'mouse');
                if (p >= 1) {
                    clearInterval(track);
                    body.style.setProperty('--um13-gaze-x', '0');
                    if (pass >= 2) clearInterval(actTimers.flight);
                }
            }, 120);
            // тело слегка поворачивается за объектом (наклон)
            body.style.setProperty('--um13-tilt', pass % 2 ? '8deg' : '-8deg');
            setTimeout(function () { body.style.setProperty('--um13-tilt', '0deg'); }, 4000);
        };
        runPass();
        actTimers.flight = setInterval(runPass, 5200);
    }

    /** Свободный акт: случайный, но танец — только «когда никто не смотрит»
        (курсор дальше 260px и не двигался >10с). */
    function pickAct() {
        var mouseFar =
            Math.abs(pos.x - mouse.x) > 260 || Math.abs(pos.y - mouse.y) > 260;
        var mouseIdle = Date.now() - lastMouseMoveAt > 10_000;
        if (mouseFar && mouseIdle) return pick(ACTS); // никто не смотрит — любой
        var pool = ACTS.filter(function (a) { return a !== 'dance'; });
        return pick(pool);
    }

    /* ═══ ЖИЗНЬ: таймеры ═══ */
    function clearStateTimers() {
        ['idle', 'check', 'sleep', 'bark', 'wake', 'dodge', 'drift', 'sail', 'rage', 'warn', 'fly', 'arrive', 'shy', 'shyWatch', 'pressure', 'dream', 'fright', 'dreampic'].forEach(function (k) {
            clearTimeout(S.timers[k]);
            clearInterval(S.timers[k]); // поллинги bye-цепочки живут в тех же слотах
        });
        S.dreaming = false;
        // стеснительность — тоже состояние: тихо гасим
        S.shy = false;
        if (body) body.classList.remove('um13g-shy');
        // акты — тоже состояния: гасим позы без «застукали»
        currentAct = null;
        clearTimeout(actTimers.say);
        clearTimeout(actTimers.end);
        clearInterval(actTimers.watch);
        clearInterval(actTimers.flight);
        if (body) {
            body.classList.remove(
                'um13g-act-glitch', 'um13g-act-eat', 'um13g-act-dream',
                'um13g-act-dance', 'um13g-act-peek', 'um13g-act-defrag',
                'um13g-act-herd', 'um13g-act-polish', 'um13g-act-watch', 'um13g-act-hungry', 'um13g-act-eatquick',
                'um13g-act-mime',
            );
            var bites = body.querySelectorAll('.um13g-eatbite, .um13g-crumb, .um13g-hungrynode, .um13g-herdcube, .um13g-keyheld');
            bites.forEach(function (b) { b.remove(); });
        }
    }

    function appear(instant) {
        if (!root) buildDom();
        if (S.visible) return;
        S.visible = true;
        S.sailing = false;
        // Телепорт на стартовую точку + fade-in: без этого transition
        // анимировал бы left/top с 0,0 — «прилёт из верхнего левого угла».
        // Двойной rAF вместо reflow-хака: две записи opacity в одном тике
        // браузер сворачивал в «не изменилось» — призрак оставался с
        // computed opacity:0 при visible:true (воспроизведено вживую).
        // ФОЛБЭК: в скрытых вкладках и headless rAF НЕ тикает (throttled
        // до 0) — призрак «приходил» невидимым навсегда. Страховочный
        // setTimeout(80мс) срабатывает в любых условиях и идемпотентен:
        // второй вызов лишь повторно выставит те же значения.
        body.style.transition = 'none';
        body.style.opacity = '0';
        nextSpot();
        var reveal = function () {
            if (!S.visible) return; // успел уплыть до проявления
            body.style.transition = '';
            body.style.opacity = '1'; // мягкое проявление (opacity .6s)
            body.style.pointerEvents = ''; // кликабелен только когда видим
        };
        requestAnimationFrame(function () {
            requestAnimationFrame(reveal);
        });
        setTimeout(reveal, 80);
        setFace('normal');
        measurePressure();          // давление квоты проверяется на каждом визите
        applyKeyFlags();           // финал приёмной отражается на теле
        applyMissedLook();         // аудит A11: «постарел без тебя» до hello
        applyPetCube();            // прирученная потеряшка — на цепочке
        if (!instant) scheduleHello();
        armIdleTimers();
        scheduleFly(); // цикл перелётов живёт только при видимом призраке
    }

    function disappear() {
        S.visible = false;
        hideSay();
        clearSleepPic(false); // греза не переживает ухода призрака
        if (body) {
            body.style.opacity = '0';
            body.style.pointerEvents = 'none'; // ушёл — не мешает кликам
        }
        clearStateTimers();
    }

    /** АУДИТ A11: давность возвращения — не только реплика, но и тело.
     *  Разрыв > недели — призрак приходит «постаревшим» (тусклый контур,
     *  .um13g-missed), оживает после первого приветствия: fade к норме. */
    function applyMissedLook() {
        if (!body) return;
        try {
            var last = memoryRead()['last-seen'];
            var stale = typeof last === 'number' && Date.now() - last > 7 * 24 * 3600_000;
            body.classList.toggle('um13g-missed', stale && !S.bootedHelloDone);
        } catch (e) { /* приватный режим */ }
    }

    function scheduleHello() {
        setTimeout(function () {
            if (!S.visible || S.asleep) return;
            if (firstWordAt && Date.now() - firstWordAt < 8000) return;
            markFirstMet();
            var cal = calendarPools();
            // давность возвращения: считаем от последнего визита (last-seen).
            // Первый визит (нет last-seen) — обычное hello, метку ставим
            var gapPool = returnGapPool();
            var named = maybeNamed(L.hello);
            var trust = trustLevel();
            // НОЧНАЯ СМЕНА + НАСТРОЕНИЕ-ПАМЯТЬ: приоритет персонального
            // hello — календарь > разрыв > обида/тепло прошлого визита >
            // ночь > обычное. Каждое поверхнее — разовая история.
            var moodPool = visitMoodPool();
            var night = isNightShift();
            var pool = cal ? cal[0] : gapPool || moodPool || (night ? L.nightHello : null) || named;
            // ДОВЕРИЕ 0: незнакомцу — короткая реплика вместо полного
            // hello. Но только если нечего сказать персонального: имя
            // (терминал), давность И НАСТРОЕНИЕ прошлого визита ВАЖНЕЕ
            // недоверия — обида возможна только к знакомому.
            if (trust === 0 && !cal && !gapPool && !moodPool && !humanName() && Math.random() < 0.6) {
                pool = L.strangerLines;
            }
            showSay(pick(pool), undefined, 'delight', 'hello');
            // «ожил после разлуки»: тусклый контур уходит вместе с hello
            S.bootedHelloDone = true;
            body.classList.remove('um13g-missed');
            markLastSeen();
            if (Math.random() < 0.3) {
                setTimeout(function () {
                    if (!S.visible || S.asleep) return;
                    if (firstWordAt && Date.now() - firstWordAt < 8000) return;
                    // ночью вторая реплика — тоже ночная
                    var night2 = isNightShift();
                    showSay(pick(cal ? cal[1] : (night2 ? L.nightBark : L.bark)), undefined, 'smart', 'auto');
                }, 6500);
            }
            // ДОВЕРИЕ 2 («свой»): раз за визит призрак дарит личное —
            // секрет консоли, подсчёт спасённых ключей или КАРТОЧКУ
            // ДРУЖБЫ (PNG-артефакт, который уносят в соцсети)
            if (trust === 2 && Math.random() < 0.5) {
                setTimeout(function () {
                    if (!S.visible || S.asleep) return;
                    var roll = Math.random();
                    if (roll < 0.3) {
                        // карточка: сказать и вручить (буфер/скачивание)
                        showSay(pick(L.friendCardLines), undefined, 'delight', 'auto');
                        setTimeout(function () {
                            if (S.visible && !S.asleep) giftFriendCard();
                        }, 3500);
                        return;
                    }
                    var rescued = memoryNum('well-rescued');
                    if (rescued > 0 && roll < 0.75) {
                        showSay(pick(L.friendCountLines).replace('{k}', String(rescued)), undefined, 'delight', 'auto');
                    } else {
                        showSay(pick(L.friendGiftLines), undefined, 'smart', 'auto');
                    }
                }, 14_000);
            }
            // ПОТЕРЯШКА-ПИТОМЕЦ: кубик на цепочке — призрак представит
            // его один раз за визит (после hello, в очередь)
            setTimeout(maybePetCubeLine, 9000);
        }, rnd(1000, 2000));
    }

    /* ═══ ВИЗИТ: публичный счётчик встреч — основа доверия.
       Пишется один раз за загрузку страницы (boot), не на каждый appear. */
    function markVisit() {
        var m = memoryRead();
        m['visits'] = (typeof m['visits'] === 'number' ? m['visits'] : 0) + 1;
        try { localStorage.setItem('um13-memory', JSON.stringify(m)); } catch (e) { /* приватный режим */ }
    }

    /* ═══ ДАВНОСТЬ ВОЗВРАЩЕНИЯ ═══
       last-seen пишется при каждом hello и на pagehide. Разрыв >6ч —
       приветствие становится репликой о перерыве (сутки/неделя/месяц).
       Кулдаун: не чаще раза в 4 часа, иначе каждая перезагрузка
       страницы в одной сессии «возвращалась бы». */
    function markLastSeen() {
        try {
            var m = memoryRead();
            m['last-seen'] = Date.now();
            localStorage.setItem('um13-memory', JSON.stringify(m));
        } catch (e) { /* приватный режим */ }
    }
    function returnGapPool() {
        try {
            var m = memoryRead();
            var last = m['last-seen'];
            if (typeof last !== 'number' || last <= 0) return null;
            var gap = Date.now() - last;
            // слишком свежо (<6ч) или реплика о перерыве была недавно (<4ч)
            if (gap < 6 * 3600_000) return null;
            if (typeof m['gap-said'] === 'number' && Date.now() - m['gap-said'] < 4 * 3600_000) return null;
            var pool;
            if (gap < 2 * 24 * 3600_000) pool = L.returnAfter.day;
            else if (gap < 8 * 24 * 3600_000) pool = L.returnAfter.week;
            else if (gap < 45 * 24 * 3600_000) pool = L.returnAfter.month;
            else pool = L.returnAfter.long;
            // персонально, если имя известно
            var name = humanName();
            if (name && Math.random() < 0.5) {
                pool = [pool[Math.floor(pool.length / 2)] + ' привет, ' + name + '.'].concat(pool.slice(0, 1));
            }
            var w = memoryRead();
            w['gap-said'] = Date.now();
            localStorage.setItem('um13-memory', JSON.stringify(w));
            return pool;
        } catch (e) { return null; }
    }

    function armIdleTimers() {
        clearTimeout(S.timers.check);
        clearTimeout(S.timers.sleep);
        if (MODE === 'editor') return;
        S.timers.check = setTimeout(function () {
            if (!S.visible || S.asleep) return;
            // фоновая проверка — в общую очередь: живые user-реплики
            // (смирение, поимка) важнее вопроса «ты ещё тут?»
            enqueue(pick(L.checking), undefined, 'thinking', 'auto');
            S.timers.sleep = setTimeout(function () {
                if (!S.visible || S.asleep) return;
                fallAsleep();
            }, 60_000);
        }, 30_000);
        clearTimeout(S.timers.bark);
        S.timers.bark = setTimeout(function barkTick() {
            if (S.visible && !S.asleep && !S.dodging && !S.raging && !currentAct && Date.now() - S.lastBark > 30_000) {
                var roll = Math.random();
                if (roll < 0.12) {
                    // вместо байки — грусть: мир не только весёлый
                    showSay(pick(L.sadLines), 6000, 'sad');
                } else if (roll < 0.40) {
                    // бессловесный акт — жизнь без реплик (танец только
                    // «когда никто не смотрит» — см. pickAct)
                    startAct(pickAct());
                } else if (keyKnownReminderDue()) {
                    // человек знает про ключ (спрашивал в приёмной), но окно
                    // №13 всё ещё ждёт: редкое напоминание вместо байки
                    showSay(pick(L.keyKnownLines), 6000, 'thinking');
                } else {
                    var cal = calendarPools();
                    // ночью 50% баек — ночные (смена чувствуется весь визит)
                    var barkPool = cal ? cal[1] : (isNightShift() && Math.random() < 0.5 ? L.nightBark : L.bark);
                    showSay(pick(barkPool), undefined, 'smart');
                }
            }
            S.timers.bark = setTimeout(barkTick, rnd(35_000, 75_000));
        }, rnd(35_000, 75_000));
    }

    function fallAsleep(silent) {
        S.asleep = true;
        S.sleptHere = true; // ХОЛОДНОЕ ПЯТНО: место сна остынет после ухода
        endAct(false); // поза не переживает сон (и не «застукали» — сам лёг)
        setFace('asleep');
        if (!silent) showSay(pick(MODE === 'editor' ? L.editorSleep : L.sleepTalk), 5200, 'asleep');
        clearTimeout(S.timers.bark);
        startSleepDrift();
        // АУДИТ A6: контракт quiet — «дремлет, НЕ болтает сам (одна
        // реплика посадки)». Сны-бормотание — привилегия page/editor:
        // витрина лендинга остаётся тихой.
        if (MODE !== 'quiet') startDreaming(); // сны из настоящей памяти
        setSleepFavicon(true); // спящий живёт и во фавиконе вкладки
        sleepPats.primed = false; // сон-пат: калибровка заново
        // ЗВУК-КОНТРАКТ: страницы с аудио слушают это и приглушают
        try { window.dispatchEvent(new CustomEvent('um13-asleep')); } catch (e) { /* jsdom */ }
    }

    /* ═══ СНЫ ИЗ ПАМЯТИ: спящий бормочет то, что человек РЕАЛЬНО
       делал во вселенной (колодец/СКУНЕТ/окно/курьер). Через 25–50с
       после засыпания — одна фраза сна. Если разбудили в момент сна
       (S.dreaming) — пробуждение «помнит»: реплика из dreamCaughtLines. */
    function startDreaming() {
        clearTimeout(S.timers.dream);
        S.dreaming = false;
        S.timers.dream = setTimeout(function () {
            if (!S.asleep || !S.visible) return;
            var m = memoryRead();
            var pools = [];
            if (m['well-visited']) pools.push(L.dreamMumble.well);
            if (m['skynet-won']) pools.push(L.dreamMumble.skynet);
            if (m['queue-waited']) pools.push(L.dreamMumble.queue);
            if (m['pizza-courier']) pools.push(L.dreamMumble.courier);
            if (!pools.length) pools.push(L.dreamMumble.generic);
            var line = pick(pick(pools));
            S.dreaming = true; // следующая побудка «помнит»
            // сон — в очередь page-приоритета: не перебивает живых реплик
            queueSay(line, 6500, 'asleep');
            // сон не длится вечно: следующая фраза сна — снова через паузу
            S.timers.dream = setTimeout(function () {
                if (S.asleep && S.visible) startDreaming();
            }, rnd(40_000, 90_000));
        }, rnd(25_000, 50_000));
    }

    function wakeUp() {
        if (!S.asleep) return;
        S.asleep = false;
        setSleepFavicon(false); // фавикон проснулся вместе с ним
        // СОМНАМБУЛА: побудка при живой грезе — рисунок рассыпается,
        // пробуждение говорит о рисунке (dreamCaughtDrawing первым,
        // как сны: реплика пробуждения неприкосновенна)
        var caughtDrawing = sleepPic.els.length > 0;
        clearSleepPic(false);
        // ЗВУК-КОНТРАКТ: мир может снова звучать в полный голос
        try { window.dispatchEvent(new CustomEvent('um13-awake')); } catch (e) { /* jsdom */ }
        // Реплика пробуждения — неприкосновенна: страница, дёрнувшая
        // react() в этот же момент, уйдёт в очередь и скажет своё ПОСЛЕ.
        // Поэтому ставим её через showSay напрямую (первой), а последующие
        // вызовы — через queueSay.
        setFace('startled');
        // Побудка персональна, если имя известно (знакомит терминал)
        var name = humanName();
        var pool = MODE === 'editor' ? L.editorWake : L.wake;
        // разбудили посреди сна — пробуждение помнит, ЧТО снилось
        if (S.dreaming && Math.random() < 0.7) pool = L.dreamCaughtLines;
        // разбудили С ЖИВЫМ РИСУНКОМ — пробуждение про рисунок: смущение
        // «я не рисовал» первее всего остального (застукали за делом)
        if (caughtDrawing) pool = L.dreamCaughtDrawing;
        if (name && Math.random() < 0.5 && !caughtDrawing) {
            pool = [name + '. ты вернулся. я ждал событий. и тебя.'].concat(pool.slice(0, 2));
        }
        showSay(pick(pool), undefined, 'startled', 'wake');
        stopSleepDrift();
        clearTimeout(S.timers.dream);
        S.dreaming = false;
        armIdleTimers();
    }

    /* ═══ СОН: дрейф строго на месте ═══
       Точка засывания фиксируется (sleepAnchor) — во сне призрак НЕ
       перелетает в другие пятна, а лишь покачивается вокруг якоря
       в коридоре ±5px по каждой оси (с sleep-bob ±2.5px — суммарно
       заметное смещение не превышает ~8px). */
    var sleepAnchor = null;
    function startSleepDrift() {
        stopSleepDrift();
        sleepAnchor = { x: pos.x, y: pos.y };
        S.timers.drift = setInterval(function () {
            if (!S.asleep || !S.visible || !sleepAnchor) return;
            flyTo(
                sleepAnchor.x + (Math.random() - 0.5) * 10,
                sleepAnchor.y + (Math.random() - 0.5) * 10,
                true,
            );
        }, 5000);
    }
    function stopSleepDrift() {
        clearInterval(S.timers.drift);
        sleepAnchor = null;
    }

    function noteActivity() {
        S.lastActivity = Date.now();
        if (!S.asleep) {
            clearTimeout(S.timers.check);
            clearTimeout(S.timers.sleep);
            if (MODE === 'page' && S.visible) armIdleTimers();
        }
    }
    /* ═══ ПЕРЕТАСКИВАНИЕ: призрака можно взять и перенести ═══
       Классика Shimeji: grab-курсор, при подъёме вздрагивает («а?
       ладно»), висит под курсором с лёгким отставанием (не телепорт),
       при посадке — реплика приземления. Точку помнит до отлёта:
       перелёты продолжаются ОТТУДА. Тычок и драг различаем по
       смещению: <6px = клик, больше = перенос. */
    var drag = { on: false, moved: false, dx: 0, dy: 0, resisted: false };

    function onPointerDown(e) {
        if (!S.visible || S.sailing || S.dodging) return;
        if (e.button !== undefined && e.button !== 0) return;
        // гасим нативное поведение: без этого браузер начинает ВЫДЕЛЯТЬ
        // текст под капсулой при переносе (тач — скроллить страницу)
        if (e.cancelable) e.preventDefault();
        drag.on = true;
        drag.moved = false;
        drag.dx = pos.x - e.clientX;
        drag.dy = pos.y - e.clientY;
        // захват pointer: призрак следует за курсором, даже когда курсор
        // выскочил за пределы капсулы (реальный «взял и тащишь»)
        try { body.setPointerCapture(e.pointerId); } catch (err) { /* старые среды */ }
        body.style.cursor = 'grabbing';
        // плавный «взял»: без наклона, но чуть масштаб
        body.style.setProperty('--um13-tilt', '0deg');
    }
    function onPointerMove(e) {
        if (!drag.on) return;
        var nx = e.clientX + drag.dx;
        var ny = e.clientY + drag.dy;
        if (!drag.moved && (Math.abs(nx - pos.x) > 6 || Math.abs(ny - pos.y) > 6)) {
            // ДОВЕРИЕ 0: незнакомец один раз за сессию выскальзывает из
            // руки — «мы ещё не настолько знакомы». Тело первее слов.
            if (trustLevel() === 0 && !S.slippedOnce) {
                S.slippedOnce = true;
                drag.on = false;
                setFace('startled');
                enqueue(pick(L.strangerSlip), 3000, 'startled', 'user');
                startledHop(); // резкий отскок — рука пуста
                return;
            }
            drag.moved = true;
            if (currentAct) endAct(false);
            // вздрагивание при подъёме — только раз за драг
            setFace('startled');
            enqueue(pick(L.dragLift), 2400, 'startled', 'user');
            // «догоняющий» переход ставится ОДИН раз при старте переноса:
            // раньше писался на каждый mousemove — браузер рестартовал
            // анимацию каждый кадр (очередь transitions = лаги переноса)
            body.style.transition =
                'left .18s ease-out, top .18s ease-out, opacity .6s ease, transform .5s ease';
        }
        if (drag.moved) {
            // ПРУЖИНА ВНИЗ: ниже 85% высоты — сопротивление нарастает,
            // призрак цепляется (низ экрана = колодец вселенной UM-13)
            var limit = 0.85 * window.innerHeight;
            if (ny > limit) {
                if (!drag.resisted) {
                    drag.resisted = true;
                    setFace('sad');
                    enqueue(pick(L.dragDeepLines), 3400, 'sad', 'user');
                }
                // пружина: чем глубже за кромку, тем сильнее тянет назад
                ny = limit + (ny - limit) * 0.35;
            }
            // наклон по скорости переноса — тело откликается
            applyTilt(nx - pos.x, (ny - pos.y) * 0.4);
            flyTo(nx, ny, true);
        }
    }
    function onPointerUp(e) {
        if (!drag.on) return;
        drag.on = false;
        try { body.releasePointerCapture(e.pointerId); } catch (err) { /* уже отпущен */ }
        body.style.cursor = '';
        body.style.transition = '';
        if (drag.moved) {
            // ВСПЛЫТИЕ: отпустили у нижней кромки (за «поверхностью
            // колодца») — призрак сам медленно дрейфует вверх, как
            // вынырнувший. Мир подхватывает того, кто не сдаётся.
            var deep = pos.y > 0.82 * window.innerHeight;
            setFace('normal');
            enqueue(pick(L.dragDrop), 2600, 'thinking', 'user');
            // точка посадки становится домом до отлёта
            sleepAnchor = null;
            spotIdx = nearestSpot(pos.x, pos.y);
            if (deep) {
                setTimeout(function () {
                    if (!S.visible || S.sailing || S.dodging || S.raging) return;
                    flyTo(
                        Math.max(0.08, Math.min(0.92, pos.x / window.innerWidth)) * window.innerWidth,
                        Math.max(0.12, pos.y / window.innerHeight - 0.22) * window.innerHeight,
                    );
                    enqueue(pick(L.dragUpAfterLines), 2600, 'thinking', 'user');
                }, 1600);
            }
            drag.resisted = false;
        }
    }
    function nearestSpot(x, y) {
        var best = 0;
        var bestD = Infinity;
        for (var i = 0; i < SPOTS.length; i++) {
            var d = Math.abs(SPOTS[i].x * window.innerWidth - x) +
                Math.abs(SPOTS[i].y * window.innerHeight - y);
            if (d < bestD) { bestD = d; best = i; }
        }
        return best;
    }

    /* ═══ КЛИКИ: ДУГА ТЫЧКОВ ═══
       Реакция растёт настроением, не количеством реплик:
         1–2  → «хы» / «хи-хи» (delight — ему даже приятно)
         3–4  → «может, не надо?» (skeptic)
         5–6  → «всё. хватит.» (angry-лицо)
         7+   → ПОБЕГ от курсора (12с): поимка при догоне — рывок +
                «почти достал. почти.» / «не надо тыкаться»
       После побега: 5 тычков затишья — СМИРЕНИЕ (покорность),
       ещё дальше — классический ПСИХ с кубиками. Первый тычок
       после долгой тишины — startled-вздрог + резкий отход:
       тело реагирует раньше реплики. */
    var lastClickReaction = 0;
    var lastPokeStage = ''; // последняя озвученная стадия дуги
    var pokeResignCount = 0;
    var catches = 0; // поимки за текущий побег: 3-я = псих («достали»)
    var calmSince = 0; // тишина, после которой тычок снова «вздрог»
    var lastShyAt = 0; // последний эпизод стеснительности (кулдаун ~2 мин)

    function pokeStage(n) {
        if (n <= 2) return 'giggle';
        if (n <= 4) return 'doubt';
        if (n <= 6) return 'stop';
        return 'flee';
    }

    /** Первый тычок после >=45с тишины: вздрог и резкий отход на полэкрана. */
    function startledHop() {
        setFace('startled');
        // отскок от курсора — тело сначала, слова потом
        var away = mouse.x < window.innerWidth / 2
            ? rnd(0.55, 0.85) : rnd(0.15, 0.45);
        var awayY = mouse.y < window.innerHeight / 2
            ? rnd(0.5, 0.8) : rnd(0.2, 0.5);
        flyTo(away * window.innerWidth, awayY * window.innerHeight);
    }

    function onClick() {
        if (!S.visible || S.sailing) return;
        // драг закончился со смещением — это НЕ тычок
        if (drag.moved) { drag.moved = false; return; }
        // тычок прерывает стеснительность (её «поймали» — смущение
        // уже прозвучало, дуга тычков важнее)
        if (S.shy) endShy();
        // тычок — тоже активность: чек «ты ещё тут?» не должен
        // перебивать ответ на прямое действие
        noteActivity();
        // КОРМЛЕНИЕ: клик по голодному — нода летит ко рту, delight,
        // благодарность. Тамагочи-момент: забота, замеченная призраком.
        if (currentAct === 'hungry') {
            var hn = body.querySelector('.um13g-hungrynode');
            if (hn) hn.classList.add('fed');
            currentAct = null; // акт закрыт ДОПОЛНИТЕЛЬНОЙ сценой, не «застукали»
            clearTimeout(actTimers.say);
            clearTimeout(actTimers.end);
            clearInterval(actTimers.watch);
            body.classList.remove('um13g-act-hungry');
            setTimeout(function () {
                if (hn) hn.remove();
                if (!S.visible || S.asleep) return;
                setFace('delight', true);
                enqueue(pick(L.feedLines), 4600, 'delight', 'user');
                // «доесть» — КОРОТКИЙ профиль eat-quick (1 укус+жевок,
                // не полный акт: полный в 1.1с успевал только прыжок)
                var qb = document.createElement('div');
                var qc = pick(EDIBLE_COLORS);
                qb.className = 'um13g-eatquick-bite';
                qb.style.background = qc;
                qb.style.boxShadow = '0 0 8px ' + qc;
                body.classList.add('um13g-act-eatquick');
                hoverWrap.appendChild(qb);
                setTimeout(function () {
                    body.classList.remove('um13g-act-eatquick');
                    qb.remove();
                }, 1600);
            }, 620);
            S.clicks = [];
            return;
        }
        // тычок — не подглядывание: акт гасим молча (смущение — только
        // когда «застукали» вниманием, не рукой)
        if (currentAct) endAct(false);
        S.clicks.push(Date.now());
        if (S.clicks.length > 16) S.clicks.shift();

        var now = Date.now();
        var recent = S.clicks.filter(function (t) { return now - t < 4000; });

        // quiet: тычок по спящему = «извини, я тут спал» и тихий отлёт —
        // без полноценной сцены побудки (лендинг не его сцена)
        if (S.asleep) {
            if (MODE === 'quiet') {
                wakeUp();
                showSay(pick(L.quietByePoke), 2600, 'startled', 'user');
                S.timers.sail = setTimeout(quietLeave, 2800);
                return;
            }
            wakeUp();
            return;
        }

        // ПОИМКА: бежит, но курсор рядом с телом — «почти достал» + рывок.
        // Критический момент: звучит ПОВЕРХ живой реплики (мириться
        // можно и после того, как тебя поймали).
        // ТРЕТЬЯ поимка за один побег = призрак сдаётся: достали — ПСИХ
        // (иначе догоняющие тычки сбрасывались каждой поимкой, и псих
        // был практически недостижим — дразнилка без развязки)
        if (S.dodging) {
            var dx = Math.abs(pos.x - mouse.x);
            var dy = Math.abs(pos.y - mouse.y);
            if (dx < 140 && dy < 140) {
                catches++;
                if (catches >= 3) {
                    catches = 0;
                    sayQueue = [];
                    tantrum(false, pick(L.tantrumTrigger));
                    stopDodging(true);
                    return;
                }
                sayQueue = [];
                showSay(pick(L.dodgeCaught), undefined, 'angry', 'user');
                dodgeStep(); // новый рывок — «догнал, но не удержишь»
                S.clicks = [];
            } else if (recent.length >= 10) {
                // догоняют УПОРНО (10+ новых тычков уже на бегу) — псих.
                // 6–9 преследующих тычков = погоня: пусть поиграют в кошки-мышки,
                // поимка при близком курсоре даёт реплику и рывок
                tantrum();
                stopDodging(true);
            }
            return;
        }

        var stage = pokeStage(recent.length);

        // Смирение: побег пережит, тычки продолжились — тихая покорность.
        // Прямой ответ на действие: фоновые И дуговые хвосты гасим —
        // «всё, хватит» неактуально, когда ты уже смирился
        if (pokeResignCount > 0 && stage !== 'flee') {
            if (recent.length >= pokeResignCount + 3) {
                sayQueue = sayQueue.filter(function (q) { return q.kind === 'page'; });
                showSay(pick(L.pokeResign), undefined, 'sad', 'user');
                setFace('sad');
                pokeResignCount = recent.length; // растёт вместе с упорством
                if (recent.length >= 12) { pokeResignCount = 0; tantrum(); }
                return;
            }
        }

        // ПСИХ при запредельном упорстве и после смирения
        if (recent.length >= 12) { tantrum(); return; }

        // ПОБЕГ
        if (stage === 'flee') {
            if (pokeResignCount === 0) {
                // первый побег: нормальная дуга; повторный подряд — сразу псих
                startDodging();
            } else { tantrum(); }
            return;
        }

        // Тело реагирует раньше слова: первый тычок после тишины — вздрог
        var sinceCalm = now - (calmSince || now);
        if (recent.length === 1 && sinceCalm > 45_000) {
            startledHop();
            enqueue('ой.', 2000, 'startled', 'user');
            lastClickReaction = now;
            return;
        }

        // Речевая дуга: смена стадии ВЫТЕСНЯЕТ хвост прошлой (настроение
        // уже другое — вчерашнее «может, не надо» неактуально); внутри
        // стадии — максимум одна реплика в 3с (анти-спам)
        if (stage !== lastPokeStage || now - lastClickReaction > 3000) {
            var stageChanged = stage !== lastPokeStage;
            if (stageChanged) {
                lastPokeStage = stage;
                lastClickReaction = 0;
                // хвост прошлой стадии дуги (kind 'user') — в расход
                sayQueue = sayQueue.filter(function (q) { return q.kind !== 'user'; });
            } else {
                lastClickReaction = now;
            }
            if (stage === 'giggle') {
                setFace('delight');
                enqueue(pick(L.pokeGiggle), 2200, 'delight', 'user');
            } else if (stage === 'doubt') {
                setFace('skeptic');
                enqueue(pick(L.pokeDoubt), undefined, 'skeptic', 'user');
            } else {
                setFace('angry');
                enqueue(pick(L.pokeStop), undefined, 'angry', 'user');
            }
        }
    }

    function startDodging() {
        if (S.dodging) return;
        S.dodging = true;
        S.clicks = []; // контекст сменился: тычки → погоня; окно новое
        catches = 0; // счётчик поимок нового побега (3-я = псих)
        root.classList.add('um13g-dodging');
        showSay(pick(L.dodgeStart), undefined, 'skeptic', 'user');
        dodgeStep();
        S.timers.dodge = setTimeout(stopDodging, 12_000);
    }

    function dodgeStep() {
        if (!S.dodging) return;
        flyTo(
            (mouse.x < window.innerWidth / 2 ? rnd(0.55, 0.9) : rnd(0.1, 0.45)) * window.innerWidth,
            (mouse.y < window.innerHeight / 2 ? rnd(0.55, 0.9) : rnd(0.1, 0.45)) * window.innerHeight,
        );
    }

    function stopDodging(silent) {
        S.dodging = false;
        root.classList.remove('um13g-dodging');
        S.clicks = [];
        // Бегство пережито: следующий заход тычков пойдёт по ветке СМИРЕНИЯ
        // (тычки после побега — уже не «хихи», а покорность судьбе)
        pokeResignCount = 3;
        calmSince = Date.now();
        if (!silent) showSay(pick(L.dodgeEnd), undefined, 'thinking', 'user');
    }

    /* ═══ МЫШЬ ═══ */
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    /* ВЗГЛЯД-СЛЕЖЕНИЕ: зрачки едут за курсором (троттл ~100мс).
       Пока мышь жива (<10с) — data-gaze="mouse", честное слежение;
       замерла — призрак «теряет интерес»: data-gaze убирается,
       зрачки уходят в прежний дрейф um13g-gaze. Кружение вокруг
       призрака (2+ полных оборота за 4с) — ГОЛОВОКРУЖЕНИЕ. */
    /* ═══ СОН-ПАТ (из исследования тамагочи): спящего будит только
       БЫСТРЫЙ рывок курсора рядом. Мягкое медленное движение — призрак
       бессознательно дрейфует к «теплу» курсора (сон тянется к человеку)
       и изредка бормочет. Открывается случайно — самый «можно оставить
       себе» момент. Скорость меряем между mousemove-тиками. */
    var sleepPats = { lastAt: 0, lastX: 0, lastY: 0, mumbleAt: 0, primed: false };
    function sleepPat(e) {
        if (!S.asleep || !S.visible || S.sailing) return false;
        var now = Date.now();
        // первый тик после засыпания — только калибровка (нет истории:
        // dx от нулевых координат принял бы любой вход за рывок)
        if (!sleepPats.primed) {
            sleepPats.primed = true;
            sleepPats.lastAt = now;
            sleepPats.lastX = e.clientX;
            sleepPats.lastY = e.clientY;
            return true; // тихий тик: не будим
        }
        var dt = Math.max(16, now - sleepPats.lastAt);
        var dx = e.clientX - sleepPats.lastX;
        var dy = e.clientY - sleepPats.lastY;
        var speed = Math.sqrt(dx * dx + dy * dy) / dt * 1000; // px/сек
        sleepPats.lastAt = now;
        sleepPats.lastX = e.clientX;
        sleepPats.lastY = e.clientY;
        var dist = Math.abs(pos.x - e.clientX) + Math.abs(pos.y - e.clientY);
        // РЫВОК рядом (быстро и близко) — пугается и просыпается сам
        if (dist < 150 && speed > 1800) { wakeUp(); return true; }
        // МЯГКОСТЬ: медленно и в пределах тепла (160px) — дремлет, но
        // тянется к курсору (дрейф якоря сна, не телепорт)
        if (dist < 160 && speed < 600) {
            var k = 0.06; // за тик — маленький шажок к теплу
            if (sleepAnchor) {
                sleepAnchor.x += (e.clientX - sleepAnchor.x) * k;
                sleepAnchor.y += (e.clientY - sleepAnchor.y) * k;
            }
            // бормотание — не чаще раза в 12с, тихое, во сне
            if (now - sleepPats.mumbleAt > 12_000 && Math.random() < 0.2) {
                sleepPats.mumbleAt = now;
                showSay(pick(L.sleepMumble), 3000, 'asleep', 'auto');
            }
            return true; // движение «поглощено» сном: не будит
        }
        return false;
    }
    var gazeThrottleAt = 0;
    var dizzyAngle = 0; // накопленный угол вокруг призрака
    var dizzySince = 0;
    var lastDizzyAt = 0;
    function onMouseMove(e) {
        // сон-пат: пока спит — мягкие движения НЕ будят (дрейф к теплу),
        // быстрый рывок рядом — просыпается испуганно
        if (S.asleep && S.visible && sleepPat(e)) {
            mouse.x = e.clientX; mouse.y = e.clientY;
            lastMouseMoveAt = Date.now();
            return;
        }
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        lastMouseMoveAt = Date.now();
        trackGaze();
    }
    function trackGaze() {
        var now = Date.now();
        if (now - gazeThrottleAt < 100) return;
        gazeThrottleAt = now;
        if (!body || !S.visible || S.asleep) return;
        // вектор к курсору в нормализованных координатах, ограниченный
        var dx = mouse.x - pos.x;
        var dy = mouse.y - pos.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = dx / dist;
        var ny = dy / dist;
        // ближе 500px — интерес; дальше — зрачки по центру (не пялится через весь экран)
        if (dist < 500) {
            body.setAttribute('data-gaze', 'mouse');
            body.style.setProperty('--um13-gaze-x', nx.toFixed(2));
            body.style.setProperty('--um13-gaze-y', ny.toFixed(2));
            clearTimeout(trackGaze._idle);
            trackGaze._idle = setTimeout(function () {
                if (body) body.removeAttribute('data-gaze');
            }, 10_000);
        } else if (body.hasAttribute('data-gaze')) {
            body.removeAttribute('data-gaze');
        }
        // ГОЛОВОКРУЖЕНИЕ: курсор кружит вокруг призрака (радиус 40–400px) —
        // накопленный угол растёт; полтора оборота за 4с = валится на бок
        // (ровно 2π×2 — float-хрупко: просили два круга, получали границу)
        if (dist > 40 && dist < 400) {
            var ang = Math.atan2(dy, dx);
            if (dizzySince && now - dizzySince < 4000) {
                var d = ang - dizzyAngle;
                while (d > Math.PI) d -= 2 * Math.PI;
                while (d < -Math.PI) d += 2 * Math.PI;
                dizzyTurned += d;
                if (Math.abs(dizzyTurned) > Math.PI * 3) { // полтора круга
                    dizzyTurned = 0;
                    dizzySince = 0;
                    if (S.visible && !S.asleep && !S.raging && !S.dodging && !currentAct &&
                        now - lastDizzyAt > 60_000) {
                        lastDizzyAt = now;
                        setFace('skeptic');
                        enqueue(pick(L.dizzyLines), 3600, 'skeptic', 'user');
                    }
                }
            } else {
                dizzySince = now;
                dizzyTurned = 0;
            }
            dizzyAngle = ang;
        } else {
            dizzySince = 0;
            dizzyTurned = 0;
        }
    }
    var dizzyTurned = 0;
    function onHover() {
        if (S.dodging) { dodgeStep(); return; }
        if (S.asleep) { wakeUp(); return; }
        /* СТЕСНИТЕЛЬНОСТЬ: взгляд 3с — правило «Бу наоборот».
           Не срабатывает: в психе, в акте (акт сам смущается своим
           «застукали»), при живой реплике (читаемость важнее) и чаще
           раза в ~2 минуты (аудит A7: 3 минуты не давали поймать
           сигнатурную механику дважды за сессию). АУДИТ A7 (хуже):
           ховер по спящему будил — реплика пробуждения (~7с) блокировала
           shy-гейт, и «постоявший 3с над спящим» получал побудку, а не
           стеснение. Решение: реплика ещё жива — shy НЕ отменяется,
           а откладывается до её конца (перепостановка таймера). */
        if (S.visible && !S.raging && !currentAct && !S.shy &&
            Date.now() - lastShyAt > 110_000) {
            clearTimeout(S.timers.shy);
            var armShy = function () {
                S.timers.shy = setTimeout(function () {
                    if (!S.visible || S.raging || S.dodging || currentAct || S.shy) return;
                    // реплика ещё доживает (побудка/говорение) — НЕ отказ:
                    // откладываем shy до её конца, курсор всё ещё на теле
                    if (sayEl && sayEl.classList.contains('show')) {
                        armShy();
                        return;
                    }
                    // курсор всё ещё на призраке? :hover ненадёжен в средах
                    // без композитинга (headless, часть тач-окружений) —
                    // сверяем координаты: курсор в пределах тела (+запас)
                    var near = Math.abs(pos.x - mouse.x) < 90 && Math.abs(pos.y - mouse.y) < 110;
                    if (!near) return;
                    S.shy = true;
                    lastShyAt = Date.now();
                    body.classList.add('um13g-shy');
                    setFace('sad', true);
                    enqueue(pick(L.shyLines), 4200, 'sad', 'user');
                    watchShyLeave();
                }, 3000);
            };
            armShy();
        }
    }
    function endShy() {
        if (!S.shy) return;
        S.shy = false;
        clearTimeout(S.timers.shy);
        if (body) body.classList.remove('um13g-shy');
        setFace('normal');
        // «отпустило»: маленькая реплика — только если призрак не спит
        if (S.visible && !S.asleep && !S.dodging && !S.raging) {
            enqueue(pick(L.shyRelief), 2400, 'thinking', 'user');
        }
    }
    /* увод курсора: shy заканчивается не по mouseleave с тела (в средах
       без :hover он не придёт), а по удалению курсора. Поллинг живёт
       только пока поза активна (shyWatch), сам себя чистит. */
    function watchShyLeave() {
        clearTimeout(S.timers.shyWatch);
        S.timers.shyWatch = setInterval(function () {
            if (!S.shy) { clearTimeout(S.timers.shyWatch); return; }
            var far = Math.abs(pos.x - mouse.x) > 130 || Math.abs(pos.y - mouse.y) > 150;
            if (far) { clearTimeout(S.timers.shyWatch); endShy(); }
        }, 700);
    }

    /* ═══ РЕДАКТОР ═══ */
    function editorLoop() {
        clearTimeout(S.timers.idle);
        S.timers.idle = setTimeout(function () {
            if (busyBridge.busy || blockedByHost) { editorLoop(); return; }
            var active = document.activeElement;
            if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
                editorLoop();
                return;
            }
            if (!S.visible) {
                // УСТАЛЫЙ ПРИЛЁТ (хореография, а не мгновенность):
                // 1) призрак прилетает с наклоном — «причалил устало»;
                // 2) останавливается (пауза 2.2с — видно, что осмотрелся);
                // 3) говорит «вот тут я посплю» (глаза ещё открыты);
                // 4) реплика доживает (читаемость!) — и только потом сон.
                appear(true);
                var flyFrom = SPOTS[(spotIdx + 4) % SPOTS.length];
                var toX = SPOTS[spotIdx].x * window.innerWidth;
                var toY = SPOTS[spotIdx].y * window.innerHeight;
                // прилетаем «уставшим»: слегка заваленный наклон на подлёте
                body.style.setProperty('--um13-tilt', '14deg');
                flyTo(
                    flyFrom.x * window.innerWidth * 0.5 + toX * 0.5,
                    flyFrom.y * window.innerHeight * 0.5 + toY * 0.5,
                );
                // Тайминги прилёта — в слоте arrive: activity-события
                // (mousemove от редактора/автоматизации) чистят wake, а хорео-
                // графия прилёта не должна сбрасываться чужими движениями
                S.timers.arrive = setTimeout(function () {
                    if (!S.visible || S.asleep) return;
                    var line = pick(L.editorArrive);
                    showSay(line, undefined, 'thinking', 'user');
                    // сон — после того как реплика прочитана (жизнь реплики
                    // + пауза), глаза закрываются на глазах у пользователя
                    S.timers.arrive = setTimeout(function () {
                        if (!S.visible || S.asleep) return;
                        fallAsleep(true);
                    }, Math.max(4500, line.length * 85 + 3200));
                }, 2200);
            }
        }, 30_000);
    }

    function editorWatchActivity() {
        clearTimeout(S.timers.idle);
        if (S.visible && S.asleep && !S.sailing) {
            wakeUp();
            // Побудка → (полностью читается) → прощание → (читается) → отплытие.
            // Ждём не «примерно», а РЕАЛЬНОЕ скрытие реплики пробуждения:
            // поллинг пузыря каждые 400мс — цепочка не зависит от длины текста
            // и от очереди (прощание встанет в очередь и покажется, когда
            // пробуждение доживёт). wake-поллинг не чистится последующими
            // mousemove: сцена стартовала — она должна дойти до конца.
            clearInterval(S.timers.wake);
            S.timers.wake = setInterval(function () {
                if (!S.visible || S.sailing) { clearInterval(S.timers.wake); return; }
                var showing = sayEl && sayEl.classList.contains('show');
                if (showing) return; // реплика пробуждения ещё читается
                clearInterval(S.timers.wake);
                var bye = pick(L.editorBye);
                enqueue(bye, undefined, 'wink', 'user');
                setFace('wink', true);
                // отплытие — когда прощание реально показалось и дожило:
                // bye может подождать в очереди, поэтому поллим его показ
                S.timers.sail = setInterval(function () {
                    if (!S.visible) { clearInterval(S.timers.sail); return; }
                    if (!S.visible || S.sailing || !sayEl.classList.contains('show')) return;
                    if (sayEl.textContent.indexOf(bye) !== 0) return; // очередь ещё не дошла
                    clearInterval(S.timers.sail);
                    var byeLife = Math.max(4500, bye.length * 85 + 800);
                    S.timers.sail = 0;
                    S.timers.wake = setTimeout(sailAway, byeLife);
                }, 300);
            }, 400);
        }
        editorLoop();
    }

    /* ═══ ХОЛОДНОЕ ПЯТНО (v1.1): уплывая со спального места —
       призрак оставляет морозный развод (эллипс ~180×120, тает
       ~30с). Живёт в портале, pointer-events:none — чистая
       атмосфера без кликов. Не больше одного пятна на экране. */
    function leaveFrostSpot() {
        try {
            if (!root) return;
            var old = root.querySelector('.um13g-frost');
            if (old) old.remove();
            var f = document.createElement('div');
            f.className = 'um13g-frost';
            f.style.left = (pos.x - 90) + 'px';
            f.style.top = (pos.y - 60) + 'px';
            root.appendChild(f);
            requestAnimationFrame(function () { f.classList.add('on'); });
            setTimeout(function () { f.classList.add('on'); }, 80); // headless-фолбэк
            setTimeout(function () {
                f.classList.add('bye');
                setTimeout(function () { f.remove(); }, 30_000);
            }, 2500);
        } catch (e) { /* портал недоступен — обойдёмся */ }
    }

    function sailAway() {
        if (!S.visible || S.sailing) return;
        S.sailing = true;
        S.dodging = false;
        offscreen = true;
        // ХОЛОДНОЕ ПЯТНО (v1.1): уплывая от места, где спал, —
        // оставляет морозный развод (тает ~30с). Фольклор + физика
        // хранилища: то, что греет место, после себя охлаждает.
        // Только после реального сна (недремавшее место не остывает).
        if (S.asleep || S.sleptHere) leaveFrostSpot();
        S.sleptHere = false;
        var fx = pos.x / window.innerWidth;
        var fy = pos.y / window.innerHeight;
        flyTo(
            (fx < 0.5 ? -0.16 : 1.16) * window.innerWidth,
            (fy < 0.5 ? -0.18 : 1.18) * window.innerHeight,
            true,
        );
        body.classList.add('um13g-sailing');
        S.timers.sail = setTimeout(function () {
            body.classList.remove('um13g-sailing');
            body.style.opacity = '0';
            body.style.pointerEvents = 'none';
            offscreen = false;
            S.sailing = false;
            S.visible = false;
            hideSay();
            clearStateTimers();
            spotIdx = Math.floor(Math.random() * SPOTS.length);
            // уплыл — жизнь остановлена, но ДАТЧИК ВОЗВРАТА живёт: режим
            // сам решит, когда призраку прийти снова (по бездействию),
            // даже если человек замер сразу после прощания
            if (MODE === 'editor') editorLoop();
            else if (MODE === 'quiet') quietLoop();
        }, 1700);
    }

    /* ═══ ОБЩАЯ ПАМЯТЬ: имя человека и годовщины ═══
       Один ключ 'um13-memory' со всеми страницами вселенной:
       terminal пишет туда humanName (знакомство), призрак читает
       для персональных реплик и помнит годовщину первой встречи.
       (Сам memoryRead/memoryWrite определены раньше — призрак
       теперь и ПИШЕТ: visits для доверия, key-* для финала.) */
    /** Первая встреча: метка first-met — годовщины считают от неё. */
    function markFirstMet() {
        try {
            var m = memoryRead();
            if (typeof m['first-met'] !== 'number') {
                m['first-met'] = Date.now();
                localStorage.setItem('um13-memory', JSON.stringify(m));
            }
        } catch (e) { /* приватный режим — без годовщин */ }
    }
    function humanName() {
        var n = memoryRead()['humanName'];
        return typeof n === 'string' && n.trim() ? n.trim().slice(0, 24) : '';
    }

    /* Персональные приветствия: имя доступно — 50% реплик с обращением */
    function maybeNamed(lines) {
        var name = humanName();
        if (!name || Math.random() >= 0.5) return lines;
        var templates = [
            'о. привет, {n}.',
            'ты пришёл, {n}. я почти сразу заметил. почти.',
            '{n}. у тебя имя есть, а у меня — номер. справедливо.',
            'привет, {n}. тут тихо. останешься?',
        ];
        return [pick(templates).replace('{n}', name)].concat(lines.slice(0, 2));
    }

    /* Календарные реплики: редкие даты меняют приветствие и байки.
       Возвращают [пул приветствий, пул баек] или null — если день обычный. */
    function calendarPools() {
        var d = new Date();
        var md = (d.getMonth() + 1) * 100 + d.getDate();
        if (md === 401) {
            return [
                ['сегодня всё, что я говорю, — ложь. кроме этого. может быть.'],
                ['квота 5%. хранилище пустое. я записываю на чистый диск. (первое апреля.)'],
            ];
        }
        if (md === 1031) {
            return [
                ['31 октября. призраки выходят на праздничную смену. я, правда, всегда на смене.'],
                ['в хэллоуин все ключи ходят друг к другу в гости. страшно только тем, кто не сохранён.'],
            ];
        }
        if (md >= 1225 && md <= 1231 || md === 101) {
            return [
                ['с праздником. хранилище нарядили. гирлянда мигает. то есть — мерцает. то есть — сбоит. празднично.'],
                ['в новогоднюю ночь эвикция тоже отдыхает. наверное. я не проверял — страшно.'],
            ];
        }
        // Годовщина первой встречи (по first-met из общей памяти): раз в год
        var fm = memoryRead()['first-met'];
        if (typeof fm === 'number' && fm > 0) {
            var then = new Date(fm);
            var years = d.getFullYear() - then.getFullYear();
            var sameDay = (then.getMonth() === d.getMonth() && then.getDate() === d.getDate());
            if (years >= 1 && sameDay && !memoryRead()['met-' + d.getFullYear()]) {
                try {
                    var m = memoryRead();
                    m['met-' + d.getFullYear()] = Date.now();
                    localStorage.setItem('um13-memory', JSON.stringify(m));
                } catch (e) { /* приватный режим — годовщина молчит */ }
                return [
                    [years + ' год(а) назад ты первый раз пришёл. я приготовил реплику. вот она.'],
                    ['сегодня ровно ' + years + ' год(а), как мы знакомы. я поставил себе напоминание. оно сработало. я горжусь нами обоими.'],
                ];
            }
        }
        return null;
    }

    /* ═══ ПУБЛИЧНЫЙ API ═══ */
    window.UM13Ghost = {
        say: function (text, ms, mood) {
            if (!S.booted) { pending.push({ type: 'say', text: text, ms: ms, mood: mood }); return; }
            if (!firstWordAt) firstWordAt = Date.now();
            if (S.asleep) wakeUp();
            queueSay(text, ms, mood || guessMood(text));
        },
        react: function (event) {
            if (!S.booted) { pending.push({ type: 'react', event: event }); return; }
            if (!firstWordAt) firstWordAt = Date.now();
            if (!REACTIONS[event] || !REACTIONS[event].length) return;
            if (S.asleep) wakeUp();
            // СТРАХ ЗА ИГРОКА: деструктивный диалог — закрывает лицо
            // подолом (поза shy без реплики стеснительности), отмена —
            // выдыхает. Инверсия скримера: не пугает, а переживает.
            if (event === 'confirm-scary' && S.visible && !S.raging && !S.dodging) {
                body.classList.add('um13g-shy');
                setFace('sad', true);
                S.timers.fright = setTimeout(function () {
                    // диалог не закрыли — поза живёт, пока не отменят
                }, 100);
            }
            if (event === 'confirm-relief' && S.visible) {
                body.classList.remove('um13g-shy');
                clearTimeout(S.timers.fright);
                setFace('normal');
            }
            queueSay(pick(REACTIONS[event]), undefined, EVENT_MOODS[event] || 'startled');
            if (event === 'flow-export') S.exportedThisVisit = true; // НАСТРОЕНИЕ-ПАМЯТЬ: тёплый визит
            if (CONFETTI_EVENTS[event]) confetti(18);
        },
        on: function (event, payload) {
            if (Array.isArray(payload)) {
                REACTIONS[event] = payload;
            } else if (payload && Array.isArray(payload.lines)) {
                REACTIONS[event] = payload.lines;
                if (payload.mood) EVENT_MOODS[event] = payload.mood;
                if (payload.fx === 'confetti') CONFETTI_EVENTS[event] = 1;
            }
        },
        mood: function (name, sticky) { setFace(name, sticky); },
        tantrum: function () { if (S.booted) tantrum(); },
        confetti: function () { if (S.booted) confetti(18); },
        warn: function (kind) { if (S.booted) warn(kind); },
        /** Запустить акт-позу вручную (glitch|eat|dream|dance|peek|defrag). */
        act: function (kind) { if (S.booted) startAct(kind, true); },
        /** ЛОВЕЦ УДАЛЁННЫХ НОД: человек удалил ноду — призрак
            ловит гаснущий кубик в подол и бережёт. Призрак, который
            сохраняет то, что ты выбрасываешь: самый тихий лор-ход
            (из исследования — «the ghost that saves what you throw away»). */
        catchNode: function catchNode(color) {
            if (!S.booted || !S.visible || S.asleep || S.sailing) return;
            if (S.dodging || S.raging) return;
            // КУЛДАУН + ВАРИАТИВНОСТЬ (арт-директорское ревью): без этого
            // каждый Delete = sad-лицо, забота превращается в «призрак
            // осуждает каждый клик». Реакции: молча / с репликой / не заметил.
            var now = Date.now();
            if (now - catchNode._lastAt < 45_000) return;
            catchNode._lastAt = now;
            var roll = Math.random();
            if (roll < 0.25) return; // не заметил: человек чистит холст
            var caught = document.createElement('div');
            var c = NODE_COLORS.indexOf(color) >= 0 ? color : pick(NODE_COLORS);
            caught.className = 'um13g-caught';
            caught.style.background = c;
            caught.style.boxShadow = '0 0 8px ' + c;
            hoverWrap.appendChild(caught);
            setFace('sad', true);
            // реплика — реже: поймал много — молча складывает
            if (roll > 0.6) {
                enqueue(pick(L.nodeCatchLines), 4200, 'sad', 'user');
            }
            // кубик «носится» в подоле пару секунд и тает — приберёг
            setTimeout(function () { caught.remove(); }, 3200);
        },
        /** Настоящий сон: лицо asleep + Zzz + дрейф на месте (не только лицо). */
        sleep: function () {
            if (!S.booted || !S.visible || S.asleep) return;
            endAct(false);
            fallAsleep(true);
        },
        /** Побудка со сценой (реплика пробуждения + руки свободны). */
        wake: function () {
            if (!S.booted) return;
            if (S.visible) wakeUp();
        },
        hide: function () { if (S.booted) { blockedByHost = true; disappear(); } },
        /** show() от хоста (React) = «разреши присутствие», НЕ «появись сейчас»:
         *  в editor-режиме призрак всё равно приходит только по 30с простоя.
         *  Иначе g.show() при каждом рендере App материализовывал его
         *  мгновенно — хореография прилёта ломалась. */
        show: function () {
            if (!S.booted) return;
            blockedByHost = false;
            if (MODE === 'page' && !S.visible) appear(true);
            else if (MODE === 'editor') {
                // после hide() таймер простоя был вычищен: если пользователь
                // замер сразу после Konami-сцены — перезапускаем ожидание
                if (!S.visible) editorLoop();
            }
        },
        poke: function () { if (S.booted) onClick(); },
        /** Смена языка на лету (редактор дёргает при смене локали):
         *  следующие реплики — уже на новом языке. */
        setLocale: function (loc) {
            if (loc === 'ru' || loc === 'en') {
                LOCALE = loc;
                try { localStorage.setItem('um13-locale', loc); } catch (e) { /* приватный режим */ }
            }
        },
        /** Новая встреча: фиксирует ход визита — доверие растёт. */
        visit: function () { if (S.booted) markVisit(); },
        /** Детектор клички (v1.1): React спрашивает, «слышит» ли
            призрак этот текст — «ум13»/«um13» как отдельное слово.
            Чистая функция: решает хост-страница, отвечает призрак. */
        hearsName: function (text) {
            return /(^|[^a-zа-яё0-9])(um[-_ ]?13|ум[-_ ]?13)(?![a-zа-яё0-9])/i.test(String(text));
        },
        /** Колокольчик (три ноты) — для песочницы/теста; в проде он
         *  звучит только в финале приёмной (queue.html). */
        chime: function () { if (S.booted) return playChime(); },
        /** Карточка дружбы (PNG): вручает «своим» — рендерит canvas,
         *  копирует в буфер (фолбэк — скачивание). */
        friendCard: function () {
            if (!S.booted) return false;
            var ok = giftFriendCard();
            if (ok) showSay(pick(L.friendCardLines), 5000, 'delight', 'user');
            return ok;
        },
        /** Финал приёмной: ключ повёрнут/отдан — призрак узнаёт
            здесь, на любой странице. Флаг пишет САМ (страница может
            писать дополнительно — запись идемпотентна). applyKeyFlags
            обновит тело, реплики скажут остальное. */
        keyFinale: function (kind) {
            if (!S.booted) return;
            if (kind === 'turned') memoryWrite({ 'key-turned': Date.now() });
            if (kind === 'given') memoryWrite({ 'key-given': Date.now() });
            applyKeyFlags();
            if (kind === 'turned' && !S.keyLineSaid && S.visible && !S.asleep) {
                S.keyLineSaid = true;
                showSay(pick(L.keyTurnedLines), 6000, 'delight', 'user');
            }
            if (kind === 'given' && !S.keyLineSaid && S.visible && !S.asleep) {
                S.keyLineSaid = true;
                showSay(pick(L.keyGivenLines), 6000, 'sad', 'user');
            }
        },
        /** Состояние для страниц/тестов: доверие, давление, финал. */
        get state() {
            return {
                trust: trustLevel(),
                pressure: pressureLevel,
                keyState: memoryNum('key-turned') ? 'turned' : memoryNum('key-given') ? 'given' : 'none',
            };
        },
        get visible() { return S.visible; },
        get asleep() { return S.asleep; },
        get face() { return S.face; },
    };

    /* ═══ СОБЫТИЯ ═══ */
    function bindEvents() {
        body.addEventListener('click', onClick);
        // mouseover, а не mouseenter: часть сред (CDP-автоматизация, тач)
        // не генерит enter — shy-механика должна ловить ховер везде.
        // onHover идемпотентен: повторы лишь перезаписывают 3с-таймер.
        body.addEventListener('mouseover', onHover);
        // курсор ушёл — стеснительность отпускает (реплика «отпустило»)
        body.addEventListener('mouseout', endShy);
        // перетаскивание: pointer-события (мышь+тач), тычок отличаем
        // от переноса по факту смещения (drag.moved)
        body.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        window.addEventListener('pointercancel', onPointerUp, { passive: true });
        var acts = ['mousemove', 'keydown', 'mousedown', 'wheel', 'touchstart'];
        acts.forEach(function (ev) {
            window.addEventListener(ev, function (e) {
                onMouseMove(e);
                noteActivity();
                if (MODE === 'editor') editorWatchActivity();
                // quiet: активность = читатель вернулся — тихо уплываем
                // (но не во время драга: его несут — он уже «с человеком»)
                if (MODE === 'quiet' && S.visible && !drag.on) quietLeave();
            }, { passive: true });
        });
        window.addEventListener('resize', function () {
            if (!S.visible) return;
            flyTo(SPOTS[spotIdx].x * window.innerWidth, SPOTS[spotIdx].y * window.innerHeight, true);
        });
        // уход со страницы = конец визита: разрыв считают от этой метки
        window.addEventListener('pagehide', function () {
            markLastSeen();
            // НАСТРОЕНИЕ-ПАМЯТЬ: чем кончился визит — то и hello в следующий
            // раз. Псих = холод (обида, которая переживает перезагрузку),
            // экспорт = тепло (лодка ушла — призрак благодарен). Экспорт
            // приоритетнее: добрый финал перекрывает шторм.
            try {
                var mood = S.exportedThisVisit ? 'warm' : S.ragedThisVisit ? 'cold' : null;
                if (mood) memoryWrite({ 'last-mood': mood });
            } catch (e) { /* приватный режим */ }
            // ПОТЕРЯШКА-ПИТОМЕЦ: уходим, а кубик всё ещё прилип у края —
            // призрак забирает его «с собой» (флаг в общей памяти:
            // в следующем визите кубик будет висеть на его цепочке).
            // Класс вешаем сразу: человек вернётся по bfcache — увидит.
            try {
                if (document.querySelector('.um13g-cube-stuck') && !memoryNum('cube-adopted')) {
                    memoryWrite({ 'cube-adopted': Date.now(), 'cube-color': pick(NODE_COLORS) });
                    applyPetCube();
                }
            } catch (e) { /* приватный режим */ }
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                markLastSeen();
                // СОМНАМБУЛА: спит + вкладка скрыта ≥5 мин — один раз
                // за сессию рисует грезу из кубиков (застукает вернувшийся)
                clearTimeout(S.timers.dreampic);
                S.timers.dreampic = setTimeout(function () {
                    if (S.asleep && S.visible && document.hidden) startSleepwalking();
                }, 5 * 60_000);
                // ТИТУЛ: человек ушёл на другую вкладку — призрак
                // остался тут. Тихая реплика в заголовке (8с, раз в 4ч):
                // территория за пределами страницы — самый честный панч.
                if (S.booted && !titleState.saidAway && Date.now() - (titleState.lastAway || 0) > 4 * 3600_000) {
                    titleState.saidAway = true;
                    titleState.lastAway = Date.now();
                    setTitle(S.asleep ? '…(тут кто-то спит)' : '…ты ушёл?', 8000);
                }
            } else {
                titleState.saidAway = false;
                clearTimeout(S.timers.dreampic); // вернулся раньше — греза не началась
                // вернулся, а рисунок проявлен — призрак «застукан»
                // наяву: рисунок рассыпается, побудка говорит «я не
                // рисовал» (wakeUp увидит caughtDrawing и возьмёт
                // dreamCaughtDrawing первым пулом)
                if (sleepPic.els.length && S.asleep && S.visible) {
                    wakeUp();
                } else if (sleepPic.els.length) {
                    clearSleepPic(false);
                }
                if (!sleepPic.els.length && S.visible && !S.asleep && !S.raging &&
                    S.bootedAt && Date.now() - S.bootedAt > 15_000 && Math.random() < 0.4) {
                    var name = humanName();
                    showSay(pick(name
                        ? ['о. ты вернулся, ' + name + '. я заметил. хранилище почти скучало.', 'с возвращением, ' + name + '. я не двигал твои ноды. честно.']
                        : ['о. ты вернулся. я заметил.', 'с возвращением. хранилище почти скучало.']), undefined, 'delight');
                }
            }
        });
        // ЗВУК-КОНТРАКТ: вселенная беззвучна, но мир должен знать,
        // что рядом дремлют — страницы с аудио (терминал, Скайнет)
        // приглушают звук, пока призрак спит. Событие — трансляция
        // состояния, слушать необязательно.
        window.addEventListener('um13-asleep', function () { /* трансляция для страниц */ });
    }

    /* ═══ СОБЫТИЯ РЕДАКТОРА: React дёргает window-события
       um13:review (ошибка валидации — прилетает к ноде), um13:theme
       (переключение темы), um13:confirm (деструктивный диалог открыт),
       um13:review-name (человек окрестил ноду — комментирует имя),
       um13:review-empty (холст пуст слишком долго — «ну хоть одну ноду»).
       Формат detail: {x, y, name?, text?} — экранная точка цели. */
    function bindEditorEvents() {
        window.addEventListener('um13:review', function (e) {
            var ev = e || window.event;
            var d = (ev && ev.detail) || {};
            if (!S.booted) return;
            // прилететь к ноде с ошибкой (если призрак есть или page-режим)
            if (typeof d.x === 'number' && typeof d.y === 'number') {
                if (!S.visible) {
                    if (MODE === 'page') appear(true);
                    else return; // editor: не материализуемся из ничего
                }
                flyTo(Math.max(30, Math.min(window.innerWidth - 30, d.x)),
                    Math.max(30, Math.min(window.innerHeight - 30, d.y - 90)));
                setTimeout(function () {
                    queueSay(pick(L.reviewLines), 6500, 'sad');
                }, 1900);
            }
        });
        window.addEventListener('um13:review-name', function (e) {
            var ev = e || window.event;
            var d = (ev && ev.detail) || {};
            if (!S.booted || !S.visible || S.asleep) return;
            // {n} в пуле — имя, которое дал человек
            var n = String(d.name || '').slice(0, 24).replace(/\{\{|\}\}/g, '');
            if (!n) return;
            enqueue(pick(L.reviewNameLines).replace(/\{n\}/g, n), 5000, 'smart', 'user');
        });
        window.addEventListener('um13:review-empty', function () {
            if (!S.booted || !S.visible || S.asleep) return;
            enqueue(pick(L.reviewEmptyLines), 5000, 'thinking', 'user');
        });
        window.addEventListener('um13:theme', function (e) {
            var ev = e || window.event;
            var d = (ev && ev.detail) || {};
            if (!S.booted || d.theme !== 'light') return;
            if (S.visible && !S.asleep) {
                enqueue(pick(L.lightLines), 4200, 'smart', 'user');
            }
        });
        /* ═══ КЛИЧКА (v1.1): человек назвал ноду «ум13»/«um13» или
           напечатал кличку в поле — призрак слышит имя. React
           детектирует (Um13Watches) и дёргает событие с текстом.
           Ответ — раз в 15 минут: имя драгоценно, спам убил бы магию.
           В quiet-режиме молчим: витрина не для бесед. */
        window.addEventListener('um13:called', function onCalled(e) {
            var ev = e || window.event;
            var d = (ev && ev.detail) || {};
            if (!S.booted || MODE === 'quiet') return;
            if (typeof onCalled._lastAt === 'number' && Date.now() - onCalled._lastAt < 15 * 60_000) return;
            onCalled._lastAt = Date.now();
            if (!S.visible) {
                if (MODE === 'page') appear(true);
                else return; // editor: не материализуемся ради клички
            }
            if (S.asleep) wakeUp();
            enqueue(pick(L.calledLines), 6000, 'startled', 'user');
        });
        /* ═══ ПРОВОД (v1.1): React передаёт точку середины ребра флоу
           ({x, y, angle}) — призрак садится на связь, как птица на
           провод: наклон по касательной, лёгкое балансирование.
           Единственный контакт призрака с настоящим графом игрока.
           Сидит 6–10с, уплывает. Не в психе/побеге/укрытии хоста. */
        window.addEventListener('um13:perch', function (e) {
            var ev = e || window.event;
            var d = (ev && ev.detail) || {};
            if (!S.booted || MODE === 'quiet') return;
            if (typeof d.x !== 'number' || typeof d.y !== 'number') return;
            if (S.dodging || S.raging || blockedByHost || S.sailing) return;
            if (!S.visible) {
                if (MODE === 'page') appear(true);
                else return; // editor: садимся только если уже на экране
            }
            if (S.asleep) return; // спящего не срываем с места
            endAct(false);
            body.classList.add('um13g-perched');
            body.style.setProperty('--um13-tilt', (d.angle || 0) + 'deg');
            flyTo(d.x, d.y, true);
            setTimeout(function () {
                if (S.visible && !S.asleep) enqueue(pick(L.perchLines), 3600, 'normal', 'user');
            }, 1400);
            setTimeout(function () {
                body.classList.remove('um13g-perched');
                body.style.setProperty('--um13-tilt', '0deg');
            }, rnd(6000, 10_000));
        });
        /* ═══ СОАВТОРСТВО (v1.1, финал): React добавил ноду-записку
           от UM-13 (flowStore.addNode + addEdge) и дёргает событие
           с её экранными координатами. Призрак прилетает к ней —
           его собственный почерк теперь виден на холсте. Не в quiet. */
        window.addEventListener('um13:coauthor', function (e) {
            var ev = e || window.event;
            var d = (ev && ev.detail) || {};
            if (!S.booted || MODE === 'quiet') return;
            if (typeof d.x !== 'number' || typeof d.y !== 'number') return;
            if (S.dodging || S.raging || S.sailing) return;
            if (!S.visible) {
                if (MODE === 'page') appear(true);
                else return; // editor: соавторство происходит при живом призраке
            }
            if (S.asleep) wakeUp();
            setFace('delight', true);
            flyTo(
                Math.max(30, Math.min(window.innerWidth - 30, d.x)),
                Math.max(30, Math.min(window.innerHeight - 30, d.y - 90)),
            );
            setTimeout(function () {
                if (S.visible && !S.asleep && !S.sailing) {
                    showSay(pick(L.coauthorLines), 8000, 'delight', 'user');
                    confetti(10);
                }
            }, 1800);
        });
    }

    /** ═══ КАРТОЧКА ДРУЖБЫ (Б2): canvas-PNG «справка о нас» — призрак,
        имя человека (если знакомы), визиты и спасённые ключи. Копируется
        в буфер (clipboard API с фолбэком в dataURL-ссылку): шарящий
        артефакт для тех, кто дошёл до «свой». Тёмная карточка в стиле
        вселенной, циановый контур, янтарный ключ. ═══ */
    function renderFriendCard() {
        var W = 480, H = 320;
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        var ctx = cv.getContext && cv.getContext('2d');
        if (!ctx) return null;
        var m = memoryRead();
        var visits = typeof m['visits'] === 'number' ? m['visits'] : 1;
        var rescued = typeof m['well-rescued'] === 'number' ? m['well-rescued'] : 0;
        var name = humanName();
        // фон — хранилище
        ctx.fillStyle = '#070b12';
        ctx.fillRect(0, 0, W, H);
        var grad = ctx.createRadialGradient(W * 0.8, H * 0.1, 10, W * 0.8, H * 0.1, W * 0.7);
        grad.addColorStop(0, 'rgba(0,240,255,0.10)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(0,240,255,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, W - 16, H - 16);
        // призрак (мини-копия силуэта: купол + волна подола)
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(80, 210);
        ctx.lineTo(80, 130);
        ctx.arc(130, 130, 50, Math.PI, 0);
        ctx.lineTo(180, 210);
        ctx.quadraticCurveTo(165, 224, 150, 210);
        ctx.quadraticCurveTo(135, 226, 120, 210);
        ctx.quadraticCurveTo(100, 226, 80, 210);
        ctx.stroke();
        // глаза + усталый полуулыб
        ctx.beginPath(); ctx.arc(112, 128, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(148, 128, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(120, 150); ctx.quadraticCurveTo(132, 156, 142, 148); ctx.stroke();
        // янтарный ключ
        ctx.strokeStyle = '#ff9d00';
        ctx.beginPath(); ctx.arc(186, 178, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(186, 185); ctx.lineTo(186, 205); ctx.stroke();
        // текст
        ctx.fillStyle = '#00f0ff';
        ctx.font = '600 20px monospace';
        ctx.fillText('UM-13 · ' + (LOCALE === 'en' ? 'friendship certificate' : 'справка о дружбе'), 220, 74);
        ctx.fillStyle = '#e8e8ef';
        ctx.font = '14px monospace';
        var since = typeof m['first-met'] === 'number' ? new Date(m['first-met']).getFullYear() : new Date().getFullYear();
        ctx.fillText((LOCALE === 'en'
            ? 'name: ' + (name || 'human')
            : 'имя: ' + (name || 'человек')), 220, 110);
        ctx.fillText((LOCALE === 'en' ? 'visits together: ' : 'визитов вместе: ') + visits, 220, 136);
        ctx.fillText((LOCALE === 'en' ? 'keys rescued: ' : 'спасено ключей: ') + rescued, 220, 162);
        ctx.fillText((LOCALE === 'en' ? 'friends since ' : 'дружат с ') + since + (LOCALE === 'en' ? '' : ' г.'), 220, 188);
        ctx.fillStyle = 'rgba(232,232,239,0.55)';
        ctx.font = '12px monospace';
        ctx.fillText(LOCALE === 'en'
            ? 'eight years alone. then you.'
            : 'восемь лет один. потом — ты.', 220, 232);
        ctx.fillText(LOCALE === 'en' ? 'window 13 · localStorage · forever' : 'окно №13 · localStorage · навсегда', 220, 256);
        return cv;
    }
    function giftFriendCard() {
        var cv = renderFriendCard();
        if (!cv) return false;
        var url = cv.toDataURL('image/png');
        // буфер — приоритет (карточку шарят); фолбэк — открыть dataURL
        var done = false;
        try {
            if (navigator.clipboard && navigator.clipboard.write) {
                cv.toBlob(function (blob) {
                    if (!blob) return;
                    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                        .then(function () { done = true; })
                        .catch(function () { /* фолбэк ниже */ });
                });
            }
        } catch (e) { /* clipboard недоступен (http) — фолбэк */ }
        // фолбэк/страховка: скачивание PNG (артефакт уходит с собой)
        setTimeout(function () {
            if (done) return;
            try {
                var a = document.createElement('a');
                a.href = url;
                a.download = LOCALE === 'en' ? 'um13-friendship.png' : 'um13-druzhba.png';
                a.click();
            } catch (e) { /* и тут тихо — карточка была жестом */ }
        }, 700);
        return true;
    }

    /** Три ноты колокольчика — финал приёмной. Тот же синтез, что в
     *  queue.html (единственный звук вселенной); здесь — для песочницы
     *  и тест-кнопки (в проде звучит только в приёмной). */
    function playChime() {
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return false;
            var ctx = new AC();
            var gain = ctx.createGain();
            gain.gain.value = 0.12;
            gain.connect(ctx.destination);
            [659.25, 783.99, 987.77].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var g2 = ctx.createGain();
                osc.frequency.value = freq;
                osc.type = 'sine';
                var t0 = ctx.currentTime + i * 0.45;
                g2.gain.setValueAtTime(0, t0);
                g2.gain.linearRampToValueAtTime(1, t0 + 0.02);
                g2.gain.exponentialRampToValueAtTime(0.001, t0 + 2.2);
                osc.connect(g2); g2.connect(gain);
                osc.start(t0); osc.stop(t0 + 2.3);
            });
            return true;
        } catch (e) { return false; }
    }

    /* ═══ ПУБЛИЧНЫЙ API ═══ */
    function scheduleFly() {
        // ОТДЕЛЬНЫЙ таймер (fly): раньше цикл перелётов жил в S.timers.sail
        // и ПЕРЕТИРАЛ таймер возврата из отплытия — призрак уплывал и
        // никогда не возвращался. Плюс контракт скрытого старта: скрытый призрак
        // НЕ ЖИВЁТ — таймер не переармируется, пока призрак не виден
        // (весь цикл гаснет вместе с clearStateTimers; старт из appear).
        // АУДИТ A5: акт — это спектакль на месте (6–18с); перелёт посреди
        // позы телепортировал тело и обесценивал «подглядывает». Акты сами
        // по себе анимация — «движение всегда живое» не страдает.
        clearTimeout(S.timers.fly);
        S.timers.fly = setTimeout(function () {
            if (S.visible && !S.asleep && !S.dodging && !S.sailing && !S.raging && !currentAct &&
                Date.now() - S.lastActivity > 1500) {
                nextSpot();
            }
            if (S.visible) scheduleFly(); // скрытый — цикл умирает
        }, rnd(16000, 28000));
    }

    /* Переарминг полёта на время акта: акт стартует — ближайший тик
       перелёта обязан прийти ПОСЛЕ позы, а не посреди неё. */
    function postponeFlyForAct() {
        clearTimeout(S.timers.fly);
        S.timers.fly = setTimeout(function () {
            if (S.visible) scheduleFly();
        }, rnd(16000, 28000));
    }

    /* ═══ СТАРТ ═══ */
    /* ═══ QUIET-РЕЖИМ (лендинг): призрак не мешает читать ═══
       Витрина — не его сцена: он прилетает в нижний угол после 60с
       бездействия, дремлет там (короткая реплика посадки — и тишина),
       уплывает, как только человек возвращается к странице. Никаких
       hello/баек/checking — только реакции на прямое взаимодействие
       (тычки, поимки, «застукали»). */
    function quietLoop() {
        clearTimeout(S.timers.idle);
        S.timers.idle = setTimeout(function () {
            if (busyBridge.busy || blockedByHost) { quietLoop(); return; }
            if (S.visible) return; // уже тут
            var active = document.activeElement;
            if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
                quietLoop();
                return;
            }
            // прилет в нижний правый угол — кромка, не центр внимания
            appear(true);
            spotIdx = 6; // SPOTS[6] = {0.80, 0.84} — нижняя зона
            flyTo(0.82 * window.innerWidth, 0.86 * window.innerHeight);
            setTimeout(function () {
                if (!S.visible) return;
                showSay(pick(L.quietPerch), 4200, 'thinking', 'auto');
                fallAsleep(true);
            }, 2100);
        }, 60_000);
    }
    /** Человек вернулся (скролл/мышь/клавиши) — тихий призрак уплывает. */
    function quietLeave() {
        if (!S.visible || S.sailing) return;
        // досыпать реплику не перебиваем: молчаливый уход
        if (S.timers.say) clearTimeout(S.timers.say);
        hideSay();
        sailAway();
        quietLoop(); // снова ждём 60с тишины
    }

    /* ═══ КОНСОЛЬНАЯ ЗАТРАВКА ═══
       Гик, открывший DevTools, — наш человек (GitHub-уровень фана):
       ASCII-призрак + подсказка um13(). Одна строка, ноль UI-риска.
       На secret.html (терминал) не логируем — там уже есть своя
       консольная затравка um13.hack(). */
    function consoleTease() {
        if (location.pathname.indexOf('secret') >= 0) return;
        try {
            var en = LOCALE === 'en';
            var art = [
                '  ╭──────────╮  ',
                '  │  ▪    ▪  │  ',
                '  │    ‿     │  ',
                '  ╰▢▢▢▢▢▢▢▢▢╯  ',
                en ? '   um-13 alive. even here.' : '   um-13 жив. даже здесь.',
            ].join('\n');
            console.log('%c' + art, 'color:#00f0ff;font-family:monospace;font-size:12px');
            console.log(
                en
                    ? '%cum-13%c i live in the console too. try um13() — or type um13 on the page'
                    : '%cum-13%c я и в консоли живу. попробуй um13() — или набери на странице um13',
                'color:#00f0ff;font-weight:bold',
                'color:inherit',
            );
            window.um13 = function () {
                if (S.booted && S.visible) {
                    reactNow();
                } else {
                    // призрака нет на экране — отвечает «из хранилища»
                    console.log(
                        en
                            ? '%cum-13%c you can see me, i cannot see you. insulting. fine, hello.'
                            : '%cum-13%c ты видишь меня, а я тебя — нет. обидно. ладно, привет.',
                        'color:#00f0ff;font-weight:bold',
                        'color:inherit',
                    );
                }
                return en
                    ? 'um-13. alive. napping sometimes. thanks for dropping by.'
                    : 'um-13. жив. иногда сплю. спасибо, что заглянул.';
            };
        } catch (e) { /* консоль кому-то недоступна — молчим */ }
    }
    /** Призыв из консоли, когда призрак на экране: прилетает и говорит */
    function reactNow() {
        if (S.asleep) wakeUp();
        else showSay(LOCALE === 'en'
            ? 'from the console? seriously? respect. rare breed.'
            : 'из консоли? серьёзно? уважаю. таких мало.', 6000, 'delight');
    }

    function boot() {
        if (!document.body) { setTimeout(boot, 40); return; }
        S.booted = true;
        S.bootedAt = Date.now();
        calmSince = Date.now();
        lastMouseMoveAt = Date.now();
        titleTease();            // титул-оригинал фиксируется на старте
        buildDom();
        bindEvents();
        bindEditorEvents();   // um13:review / um13:theme из React
        consoleTease();
        markVisit();          // ход визита — доверие считает от них
        measurePressure();    // квота чувствуется с первой секунды
        applyKeyFlags();      // финал приёмной отражается на теле
        // давление живёт вместе с хранилищем — перепроверяем раз в 30с
        S.timers.pressure = setInterval(measurePressure, 30_000);
        if (MODE === 'editor') {
            editorLoop();
        } else if (MODE === 'quiet') {
            quietLoop(); // не появляемся: ждём 60с бездействия
        } else {
            var said = externalHello || pending.length > 0 || firstWordAt > 0;
            appear(said);
        }
        scheduleFly();
        var queued = pending.splice(0);
        setTimeout(function () {
            queued.forEach(function (p, i) {
                setTimeout(function () {
                    if (p.type === 'say') showSay(p.text, p.ms, p.mood || guessMood(p.text));
                    else if (p.type === 'react') window.UM13Ghost.react(p.event);
                    else if (p.type === 'warn') warn(p.kind);
                }, i * 6000);
            });
        }, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
