'use client';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { MonitoringConversationSummary } from '@/lib/monitoring-types';
import { HighlightBadge } from './highlight-badge';
import { heatColor, ESCALATION_COLORS, GRADE_COLORS } from '@/components/ai-performance/grade-colors';
import { cn } from '@/lib/utils';

function ScoreCell({ value }: { value: number | null }) {
    if (value === null) return <span className="text-muted-foreground">—</span>;
    const c = heatColor(value);
    return (
        <span
            className="inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold"
            style={{ backgroundColor: c.bg, color: c.text }}
        >
            {value}
        </span>
    );
}

function ResolutionCell({ value }: { value: boolean | null }) {
    if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
    return value
        ? <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Yes</span>
        : <span className="text-red-600 dark:text-red-400 text-xs font-semibold">No</span>;
}

interface ConversationTableProps {
    items: MonitoringConversationSummary[];
    selectedGradeId: string | null;
    onSelect: (gradeId: string) => void;
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export function ConversationTable({ items, selectedGradeId, onSelect, total, page, limit, onPageChange }: ConversationTableProps) {
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="text-[11px] uppercase tracking-wider">
                            <TableHead className="w-[160px]">Contact</TableHead>
                            <TableHead className="w-[130px]">Intent</TableHead>
                            <TableHead className="w-[55px] text-center">Res.</TableHead>
                            <TableHead className="w-[55px] text-center">Frust.</TableHead>
                            <TableHead className="w-[55px] text-center">Acc.</TableHead>
                            <TableHead>Highlights</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                                    No conversations match these filters.
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((item) => (
                            <TableRow
                                key={item.grade_id}
                                onClick={() => onSelect(item.grade_id)}
                                className={cn(
                                    'cursor-pointer transition-colors',
                                    selectedGradeId === item.grade_id
                                        ? 'bg-primary/5 border-l-2 border-l-primary'
                                        : 'hover:bg-muted/50',
                                    item.highlights.length > 0 && selectedGradeId !== item.grade_id
                                        ? 'border-l-2 border-l-amber-400/50'
                                        : '',
                                )}
                            >
                                <TableCell>
                                    <div className="font-medium text-sm truncate max-w-[150px]">
                                        {item.contact_name ?? 'Anonymous'}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {item.grade_date}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.intent_label ? (
                                        <span className="text-xs text-muted-foreground">{item.intent_label}</span>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <ResolutionCell value={item.resolution} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <ScoreCell value={item.frustration_score} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <ScoreCell value={item.accuracy_score} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {item.highlights.map((h) => (
                                            <HighlightBadge key={h.code} code={h.code} label={h.label} />
                                        ))}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground bg-muted/10">
                <span>{total > 0 ? `${start}–${end} of ${total}` : '0 results'}</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-2 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-2 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
