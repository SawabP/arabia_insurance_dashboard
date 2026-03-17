import type { AgentPulseDimensionAverages } from '@/lib/grades-types';
import { GRADE_COLORS } from './grade-colors';

const DIMENSION_LABELS: { key: keyof AgentPulseDimensionAverages; label: string }[] = [
    { key: 'relevancy', label: 'Relevancy' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'completeness', label: 'Completeness' },
    { key: 'clarity', label: 'Clarity' },
    { key: 'tone', label: 'Tone' },
];

export function DimensionBars({ dimensions }: { dimensions: AgentPulseDimensionAverages }) {
    return (
        <div className="flex-1">
            {DIMENSION_LABELS.map(({ key, label }) => {
                const score = dimensions[key];
                return (
                    <div key={key} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                        <span className="text-[13px] text-muted-foreground w-[100px] flex-shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${score * 10}%`, backgroundColor: GRADE_COLORS.blue }}
                            />
                        </div>
                        <span className="text-[13px] font-medium w-8 text-right">{score}</span>
                    </div>
                );
            })}
        </div>
    );
}
