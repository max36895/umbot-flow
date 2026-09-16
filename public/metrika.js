// Счётчик Яндекс.Метрики — общий для всех страниц сайта (лендинг, редактор,
// документация, пасхалки). Лежит в public/ без хэша: подключается одинаково
// и из страниц сборки Vite, и из статической документации.
// .htaccess кэширует .js на год (immutable): при правке файла добавьте
// ?v=N ко всем подключениям, иначе вернувшиеся посетители получат старую версию.
(function (m, e, t, r, i, k, a) {
    m[i] =
        m[i] ||
        function () {
            (m[i].a = m[i].a || []).push(arguments);
        };
    m[i].l = 1 * new Date();
    for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) {
            return;
        }
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=112563287', 'ym');

window.ym(112563287, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
});
