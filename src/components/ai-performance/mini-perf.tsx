import { GRADE_COLORS } from './grade-colors';

export function MiniPerf({ scores }: { scores: number[] }) {
    return (
        <div className="flex gap-0.5 items-end h-6">
            {scores.map((s, i) => (
                <div
                    key={i}
                    className="w-1 rounded-sm"
                    style={{ height: `${s * 10}%`, backgroundColor: GRADE_COLORS.blue }}
                />
            ))}
        </div>
    );
}
