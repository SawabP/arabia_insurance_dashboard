'use client';

import { useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { GRADE_COLORS } from './grade-colors';

interface ScoreRingProps {
    score: number;
    size?: number;
}

export function ScoreRing({ score, size = 140 }: ScoreRingProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scale = 2;
        const cx = (size * scale) / 2;
        const cy = cx;
        const r = ((size - 16) * scale) / 2;

        ctx.clearRect(0, 0, size * scale, size * scale);
        ctx.lineWidth = (10 * scale) / 2;
        ctx.lineCap = 'round';

        // Track arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI * 0.75, Math.PI * 0.75);
        ctx.strokeStyle = mounted && theme === 'dark' ? '#334155' : '#e8e6df';
        ctx.stroke();

        // Score arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI * 0.75, -Math.PI * 0.75 + Math.PI * 1.5 * (score / 10));
        ctx.strokeStyle = GRADE_COLORS.blue;
        ctx.stroke();
    }, [score, size, theme, mounted]);

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <canvas ref={canvasRef} width={size * 2} height={size * 2} style={{ width: size, height: size }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-3xl font-medium text-foreground">
                {score}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[10px] text-[11px] text-muted-foreground">
                overall
            </div>
        </div>
    );
}
