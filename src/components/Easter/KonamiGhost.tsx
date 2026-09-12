import { useEffect, useRef, useState } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { getLocale } from '../../i18n';
import { pickRandomGame } from '../../utils/um13Games';

/**
 * ═══════════════════════════════════════════════════════════════
 *  KONAMI-РЕЖИМ: «UM-13 приносит игру»
 * ═══════════════════════════════════════════════════════════════
 *
 * Пользователь вводит Konami-код — призрак UM-13 прилетает и
 * собирает на канвасе СЛУЧАЙНУЮ игру из пресетов (um13Games.ts):
 * «Угадай число», «Камень-ножницы-бумага», квест «Побег из
 * localStorage» или детектив «Квотный заговор».
 *
 * Игра — честный FlowDocument: играет прямо в превью редактора,
 * а кнопка на тосте скачивает flow.json — его можно запустить
 * через CLI (`npx umbot create from-flow flow.json`).
 *
 * Сцена затемняет интерфейс, курсор-призрак «собирает» игру,
 * имя бота печатается посимвольно, превью открывается само.
 */

type Phase = 'idle' | 'wake' | 'done';

interface GhostState {
    x: number;
    y: number;
    visible: boolean;
}

const sleep = (ms: number) =>
    new Promise<void>((r) => {
        setTimeout(r, ms);
    });

/** Скачивает flow.json текущего стора — тот же механизм, что Экспорт JSON. */
function downloadFlowJson() {
    const doc = useFlowStore.getState().toJSON();
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name || 'flow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function KonamiGhost({ active }: { active: boolean }) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [ghost, setGhost] = useState<GhostState>({ x: 700, y: 400, visible: false });
    const [caption, setCaption] = useState<string | null>(null);
    const [dimmed, setDimmed] = useState(false);
    const [flash, setFlash] = useState(false);
    const [downloadShown, setDownloadShown] = useState(false);
    const runningRef = useRef(false);

    useEffect(() => {
        if (!active || runningRef.current) return;
        runningRef.current = true;

        (async () => {
            const store = useFlowStore.getState();
            const ui = useUiStore.getState();
            const isRu = getLocale() === 'ru';
            const t = (ru: string, en: string) => (isRu ? ru : en);

            // Игра выбирается СРАЗУ — случайная из пресетов
            const { title, doc } = pickRandomGame();

            // ── Акт 0: затемнение, сигнал ──────────────────────────────
            setPhase('wake');
            setDimmed(true);
            setGhost({ x: window.innerWidth / 2, y: window.innerHeight * 0.25, visible: true });
            setCaption(t('…сигнал из служебного слоя…', '…signal from the service layer…'));
            await sleep(1200);

            // ── Акт 1: призрак облетает интерфейс ─────────────────────
            const corners = [
                { x: window.innerWidth * 0.15, y: window.innerHeight * 0.5 },
                { x: window.innerWidth * 0.85, y: window.innerHeight * 0.5 },
                { x: window.innerWidth * 0.5, y: window.innerHeight * 0.75 },
            ];
            for (const c of corners) {
                setGhost((g) => ({ ...g, ...c }));
                await sleep(650);
            }
            setCaption(t('UM-13: осматриваюсь. место подходящее.', 'UM-13: looking around. suitable place.'));
            await sleep(1000);

            // ── Акт 2: сборка игры (один честный шаг undo) ─────────────
            setCaption(
                t(
                    `пришёл не с пустыми руками. собираю «${title}»…`,
                    `came bearing gifts. assembling "${title}"…`,
                ),
            );
            setGhost((g) => ({ ...g, x: window.innerWidth * 0.45, y: window.innerHeight * 0.45 }));

            // Пауза перед материализацией: курсор «открывает чемодан»
            await sleep(500);
            setFlash(true);
            store.fromJSON(doc);
            await sleep(180);
            setFlash(false);

            // Прогресс-бег по узлам игры: редактор уже показал документ,
            // мы «озвучиваем» защёлкивание, чтобы сцена жила
            const nodeCount = doc.nodes.length;
            const beats = isRu
                ? [
                      `${doc.nodes.length} узлов материализовано.`,
                      `${doc.edges.length} связей защёлкнуто.`,
                      nodeCount > 10
                          ? 'сюжет ветвится. концовки настоящие.'
                          : 'механика простая. зато честная.',
                      `«${title}» — готово.`,
                  ]
                : [
                      `${doc.nodes.length} nodes materialized.`,
                      `${doc.edges.length} edges snapped in.`,
                      nodeCount > 10
                          ? 'the story branches. endings are real.'
                          : 'simple mechanics. honest ones.',
                      `"${title}" — ready.`,
                  ];
            for (const b of beats) {
                setCaption(b);
                await sleep(700);
            }

            // ── Акт 3: имя игры пишется в шапку ────────────────────────
            setCaption(t('пишу имя в шапку…', 'typing the name into the header…'));
            const nameField = document.querySelector<HTMLInputElement>('input[placeholder]');
            const botNameInput = [...document.querySelectorAll('input')].find((i) =>
                (i.placeholder || '').includes('Имя бота') || (i.placeholder || '').includes('Bot name'),
            );
            const target = botNameInput ?? nameField;
            if (target) {
                const r = target.getBoundingClientRect();
                setGhost({ x: r.x + r.width / 2, y: r.y + r.height / 2, visible: true });
                await sleep(400);
                const name = doc.name;
                for (let i = 1; i <= name.length; i++) {
                    store.setMetadata({ name: name.slice(0, i) });
                    await sleep(120);
                }
                await sleep(400);
            }

            // ── Акт 4: UM-13 открывает превью — играй прямо здесь ──────
            setCaption(t('играй прямо в превью. или забери меня с собой ↓', 'play right in the preview. or take me with you ↓'));
            await sleep(900);
            if (!useUiStore.getState().previewOpen) ui.togglePreview();

            setGhost((g) => ({ ...g, visible: false }));
            setCaption(null);
            setPhase('done');

            // ── Акт 5: тост с кнопкой скачивания flow.json ──────────────
            await sleep(400);
            setDownloadShown(true);
            useUiStore.getState().showToast(
                t(`UM-13 собрал «${title}» — играть в превью`, `UM-13 assembled "${title}" — play in the preview`),
            );

            // Затемнение гаснет; сцена оставляет после себя:
            // игру на холсте, открытое превью и один шаг undo
            setDimmed(false);
        })();

        return () => {
            runningRef.current = false;
        };
    }, [active]);

    if (phase === 'idle') return null;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[70]"
            style={{ animation: 'konamiFadeIn .4s ease-out' }}
        >
            {/* Затемнение сцены — превью и тост остаются читаемыми */}
            {dimmed && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-500" />
            )}

            {/* Вспышка материализации игры */}
            {flash && (
                <div
                    className="absolute inset-0 animate-[konamiFlash_.18s_ease-out]"
                    style={{
                        background:
                            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0, 240, 255, 0.35), transparent 70%)',
                    }}
                />
            )}

            {/* Призрачный курсор */}
            <div
                className="absolute left-0 top-0 transition-[left,top] duration-500 ease-out"
                style={{ left: ghost.x, top: ghost.y }}
            >
                <svg width="30" height="30" viewBox="0 0 24 24" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]">
                    <path
                        d="M5 3l14 8-6 2-2 6z"
                        fill="rgba(0, 240, 255, 0.85)"
                        stroke="#fff"
                        strokeWidth="1"
                    />
                </svg>
            </div>

            {/* Субтитры-статус */}
            {caption && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
                    <div className="rounded-lg border border-info/40 bg-surface-modal/95 px-5 py-2.5 font-mono text-sm text-info shadow-[0_0_24px_rgba(0,240,255,0.25)] backdrop-blur-md">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-info align-middle animate-pulse" />
                        {caption}
                    </div>
                </div>
            )}

            {/* Панель «забери игру» — после сцены, поверх всего */}
            {downloadShown && (
                <div className="pointer-events-auto absolute bottom-20 left-1/2 z-[80] -translate-x-1/2">
                    <button
                        type="button"
                        onClick={() => {
                            downloadFlowJson();
                            setDownloadShown(false);
                        }}
                        className="flex items-center gap-2 rounded-full border border-info/50 bg-surface-modal/95 px-5 py-2.5 text-sm font-medium text-info shadow-[0_0_30px_rgba(0,240,255,0.3)] backdrop-blur-md transition-colors hover:bg-info/10"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {getLocale() === 'ru' ? 'Скачать flow.json игры' : 'Download the game flow.json'}
                    </button>
                </div>
            )}
        </div>
    );
}
