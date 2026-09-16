// Пасхалка №1: 10 кликов по логотипу → служебный терминал UM-13 (/secret.html).
// Лого — ссылка на «/», поэтому каждый клик перехватываем: копим счётчик
// и на 10-м открываем секретную страницу. Обычный переход по лого
// («на главную») выполняем сами по ОДИНАРНОМУ клику через отложенный
// таймер — если пользователь кликнул второй раз, значит он «копает».
(function () {
    const logo = document.querySelector('.site-header .logo');
    if (!logo) return;
    let clicks = 0;
    let resetTimer = null;
    let navTimer = null;
    logo.addEventListener('click', function (e) {
        e.preventDefault();
        clicks++;
        clearTimeout(resetTimer);
        // окно внимания: 4 сек между кликами — иначе счётчик сбрасывается
        resetTimer = setTimeout(function () {
            clicks = 0;
        }, 4000);
        if (clicks >= 7 && clicks < 10) {
            // мягкая подсказка тем, кто уже близко
            logo.style.transform = 'rotate(' + (clicks - 6) * 2 + 'deg)';
        }
        if (clicks >= 10) {
            clearTimeout(resetTimer);
            clearTimeout(navTimer);
            clicks = 0;
            logo.style.transform = '';
            window.location.href = '/secret.html';
            return;
        }
        if (clicks === 1) {
            // одиночный клик через 350 мс тишь = обычный переход «на главную».
            // Если мы уже на главной — перезагружать страницу бессмысленно
            clearTimeout(navTimer);
            navTimer = setTimeout(function () {
                if (clicks < 2) {
                    const href = logo.getAttribute('href') || '/';
                    if (location.pathname === href) {
                        // уже здесь: прокрутим наверх, как честная ссылка на главную
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        clicks = 0;
                    } else {
                        window.location.href = href;
                    }
                }
            }, 350);
        } else {
            clearTimeout(navTimer);
        }
    });
})();

// Пасхалка №2: Konami-код (↑↑↓↓←→←→BA или WASD) → «СОБЕРИ СКУНЕТ» (/skynet/).
// Suika-мерджер: сливай чат-ботов, собирай СКУНЕТ. В полях ввода не срабатывает.
// Вторая дверь в секреты: набранное на странице слово «um13» (u-m-1-3,
// физические коды клавиш — любая раскладка) ведёт в терминал UM-13 —
// для тех, кто Konami-код не знает. Подсказка живёт в DevTools-затравке.
(function () {
    const KONAMI = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
    ];
    const WASD = { w: 'ArrowUp', s: 'ArrowDown', a: 'ArrowLeft', d: 'ArrowRight' };
    let pos = 0;
    let fired = false;
    let word = 0;
    const UM13 = ['KeyU', 'KeyM', 'Digit1', 'Digit3'];
    window.addEventListener('keydown', function (e) {
        if (fired) return;
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        // слово-вход: um13 → терминал (пасхалка №1 без 10 кликов)
        if (e.code === UM13[word]) {
            word++;
            if (word === UM13.length) {
                fired = true;
                window.location.href = '/secret.html';
                return;
            }
        } else {
            word = e.code === UM13[0] ? 1 : 0;
        }
        let key = e.key;
        // WASD — только в стрелочной части (финал кода — буквы b/a)
        if (key.length === 1 && pos < 8) key = WASD[key.toLowerCase()] || key.toLowerCase();
        else if (key.length === 1) key = key.toLowerCase();
        const expected = KONAMI[pos];
        if (key === expected || (key.length === 1 && key.toLowerCase() === expected)) {
            pos++;
            if (pos === KONAMI.length) {
                fired = true;
                window.location.href = '/skynet/';
            }
        } else {
            // лишняя ↑ в начале (↑↑↑↓↓…) не сбрасывает уже набранные ↑↑
            if (key !== KONAMI[0]) pos = 0;
            else if (pos !== 2) pos = 1;
        }
    });
})();

// Появление секций при скролле
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        els.forEach(function (el) {
            el.classList.add('visible');
        });
        return;
    }
    const io = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    io.unobserve(e.target);
                }
            });
        },
        { threshold: 0.12 },
    );
    els.forEach(function (el) {
        io.observe(el);
    });
})();

// Хедер: фон после прокрутки
(function () {
    const h = document.getElementById('site-header');

    function onScroll() {
        h.classList.toggle('scrolled', window.scrollY > 24);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
