// Общие помощники страниц вселенной UM-13 (терминал, исповедальня,
// приёмная, СКУНЕТ, колодец 404, песочницы).

// ═══ ПАМЯТЬ UM-13: общий ключ localStorage, его же читает um13-ghost.js ═══
const MEM_KEY = 'um13-memory';

export function memRead() {
    try {
        return JSON.parse(localStorage.getItem(MEM_KEY) || '{}');
    } catch (e) {
        return {};
    }
}

// ПАТЧ-семантика, как у призрака (memoryWrite в um13-ghost.js): merge поверх
// существующей памяти, null — удалить ключ. Нельзя писать весь объект —
// страница стёрла бы флаги вселенной, записанные параллельно (humanName,
// well-rescued, visits…), а память — центральный лор UM-13.
export function memWrite(patch) {
    try {
        const m = memRead();
        for (const [k, v] of Object.entries(patch)) {
            if (v === null) delete m[k];
            else m[k] = v;
        }
        localStorage.setItem(MEM_KEY, JSON.stringify(m));
    } catch (e) {}
}

export function memAdd(flag, n = 1) {
    memWrite({ [flag]: (memRead()[flag] || 0) + n });
}

// Призрак грузится defer-скриптом и может появиться позже кода страницы
export function ghostReady(fn) {
    if (window.UM13Ghost) {
        fn(window.UM13Ghost);
        return;
    }
    const t = setInterval(function () {
        if (window.UM13Ghost) {
            clearInterval(t);
            fn(window.UM13Ghost);
        }
    }, 60);
}

// ═══ base64 ⇄ UTF-8 для ссылок-посланий (#m=…, #p=…) ═══
// Без deprecated escape/unescape: они мажут кириллицу
export function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
}

export function base64ToUtf8(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(arr);
}

// ═══ Скачивание артефакта (flow.json, PNG) ═══
export function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    // Отзываем не сразу: Firefox/Safari успевают начать загрузку не всегда
    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 1000);
}

export function downloadJson(data, fileName) {
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), fileName);
}
