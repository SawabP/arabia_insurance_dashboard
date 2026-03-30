'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GRADE_COLORS } from './grade-colors';

const DIMENSION_LABELS = ['Relevancy', 'Accuracy', 'Completeness', 'Clarity', 'Tone'] as const;

function scoreColor(s: number): string {
    if (s <= 4) return '#E24B4A';
    if (s <= 6) return '#EF9F27';
    return '#1D9E75';
}

function scoreBg(s: number): string {
    if (s <= 4) return 'rgba(226,75,74,0.12)';
    if (s <= 6) return 'rgba(239,159,39,0.12)';
    return 'rgba(29,158,117,0.12)';
}

export function MiniPerf({ scores }: { scores: number[] }) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ left: 0, top: 0, showAbove: true });

    useEffect(() => {
        setMounted(true);
    }, []);

    function updatePosition() {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const showAbove = rect.top > 180;
        setPosition({
            left: rect.left + rect.width / 2,
            top: showAbove ? rect.top - 8 : rect.bottom + 8,
            showAbove,
        });
    }

    function showTooltip() {
        updatePosition();
        setVisible(true);
    }

    function hideTooltip() {
        setVisible(false);
    }

    useEffect(() => {
        if (!visible) return;

        const handler = () => updatePosition();
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [visible]);

    return (
        <>
            <div
                ref={triggerRef}
                className="relative"
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                tabIndex={0}
            >
                <div className="flex gap-0.5 items-end h-6 cursor-default">
                    {scores.map((s, i) => (
                        <div
                            key={i}
                            className="w-1 rounded-sm"
                            style={{ height: `${s * 10}%`, backgroundColor: GRADE_COLORS.blue }}
                        />
                    ))}
                </div>
            </div>

            {mounted && createPortal(
                <div
                    className={`fixed z-[60] pointer-events-none transition-all duration-150 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    style={{
                        left: position.left,
                        top: position.top,
                        transform: position.showAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                        transformOrigin: position.showAbove ? 'bottom center' : 'top center',
                    }}
                >
                    <div className="rounded-lg border border-border bg-popover shadow-lg px-3 py-2 min-w-[160px]">
                        <div className="space-y-2">
                            {scores.map((s, i) => (
                                <div key={i} className="flex items-center justify-between gap-3">
                                    <div className="text-[11px] font-medium text-popover-foreground">
                                        {DIMENSION_LABELS[i]}
                                    </div>
                                    <div
                                        className="min-w-[2rem] rounded-full px-2 py-1 text-center text-[11px] font-bold tabular-nums"
                                        style={{ backgroundColor: scoreBg(s), color: scoreColor(s) }}
                                    >
                                        {s}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        className="w-1.5 h-1.5 bg-popover border-border rotate-45 absolute left-1/2 -translate-x-1/2"
                        style={position.showAbove ? { bottom: -4, borderBottomWidth: 1, borderRightWidth: 1 } : { top: -4, borderTopWidth: 1, borderLeftWidth: 1 }}
                    />
                </div>,
                document.body,
            )}
        </>
    );
}
