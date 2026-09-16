// Движок «терминала» UM-13: посимвольная печать, варианты ответа и
// свободный ввод. Общий для сервисного терминала (secret.html) и
// исповедальни (confession.html) — разметка у них одинаковая:
// #screen, #choices, #inputline, #freeinput.
// Печать всегда посимвольная: живая машинка — часть персонажа,
// reduced-режимов нет.

/**
 * @param {{ echoMark: string, tickMs: number }} options
 *   echoMark — префикс выбранного варианта в ленте («▸», «◆»);
 *   tickMs — пауза между тиками печати (по 2 символа за тик).
 */
export function createTerminal({ echoMark, tickMs }) {
    const screenEl = document.getElementById('screen');
    const choicesEl = document.getElementById('choices');
    const inputLine = document.getElementById('inputline');
    const freeInput = document.getElementById('freeinput');

    function line(text, cls) {
        const div = document.createElement('div');
        div.className = 'line' + (cls ? ' ' + cls : '');
        div.textContent = text;
        screenEl.appendChild(div);
        div.scrollIntoView({ block: 'end' });
        return div;
    }

    // Печатает текст посимвольно; промис резолвится, когда текст допечатан
    function type(text, cls) {
        const div = line('', cls);
        return new Promise(function (resolve) {
            let i = 0;
            let cur = null;
            const tick = setInterval(function () {
                if (cur && cur.parentNode) cur.parentNode.removeChild(cur);
                // по 2 символа за тик — «машинка» не усыпляет
                i = Math.min(text.length, i + 2);
                div.textContent = text.slice(0, i);
                if (i >= text.length) {
                    clearInterval(tick);
                    resolve(div);
                } else {
                    cur = document.createElement('span');
                    cur.className = 'cursor-blink';
                    div.appendChild(cur);
                }
            }, tickMs);
        });
    }

    function pause(ms) {
        return new Promise(function (r) {
            setTimeout(r, ms);
        });
    }

    function hideInputs() {
        choicesEl.classList.remove('active');
        choicesEl.innerHTML = '';
        inputLine.classList.remove('active');
    }

    function showChoices(options) {
        choicesEl.innerHTML = '';
        options.forEach(function (opt) {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = opt.label;
            b.addEventListener('click', function () {
                hideInputs();
                line(echoMark + ' ' + opt.label, 'dim');
                opt.run();
            });
            choicesEl.appendChild(b);
        });
        choicesEl.classList.add('active');
        const first = choicesEl.querySelector('button');
        if (first) first.focus();
    }

    function showInput(handler, placeholder) {
        freeInput.value = '';
        freeInput.placeholder = placeholder || '';
        inputLine.classList.add('active');
        freeInput.focus();
        freeInput.onkeydown = function (e) {
            if (e.key === 'Enter') {
                const v = freeInput.value.trim();
                if (!v) return;
                hideInputs();
                line('> ' + v, 'dim');
                handler(v);
            }
        };
    }

    return { line, type, pause, showChoices, showInput, hideInputs };
}
