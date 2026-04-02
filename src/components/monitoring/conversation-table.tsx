'use client';

import { Check, ChevronLeft, ChevronRight, Minus, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { MonitoringConversationSummary } from '@/lib/monitoring-types';
import { HighlightBadge } from './highlight-badge';
import { heatColor, frustrationColor } from '@/components/ai-performance/grade-colors';
import { cn } from '@/lib/utils';

function formatDateLabel(value: string) {
    try {
        return format(parseISO(value), 'MMM dd');
    } catch {
        return value;
    }
}

function ScoreCell({ value, inverted = false }: { value: number | null; inverted?: boolean }) {
    if (value === null) {
        return (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F5F2] text-[#9C9889]">
                <Minus className="h-3.5 w-3.5" />
            </span>
        );
    }

    const colors = inverted ? frustrationColor(value) : heatColor(value);
    return (
        <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
        >
            {value}
        </span>
    );
}

function ResolutionCell({ value }: { value: boolean | null }) {
    if (value === null) {
        return <Minus className="mx-auto h-4 w-4 text-[#9C9889]" aria-label="Unknown resolution" />;
    }

    return value ? (
        <Check className="mx-auto h-4 w-4 text-[#1D9E75]" aria-label="Resolved" />
    ) : (
        <X className="mx-auto h-4 w-4 text-[#E24B4A]" aria-label="Unresolved" />
    );
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

export function ConversationTable({
    items,
    selectedGradeId,
    onSelect,
    total,
    page,
    limit,
    onPageChange,
}: ConversationTableProps) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = total > 0 ? (page - 1) * limit + 1 : 0;
    const end = total > 0 ? Math.min(page * limit, total) : 0;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-[#F3F4F6]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-auto w-[13rem] border-b border-[#E5E7EB] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                                Contact
                            </TableHead>
                            <TableHead className="h-auto w-[8.5rem] border-b border-[#E5E7EB] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                                Intent
                            </TableHead>
                            <TableHead className="h-auto w-[4.5rem] border-b border-[#E5E7EB] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                                Res.
                            </TableHead>
                            <TableHead className="h-auto w-[5rem] border-b border-[#E5E7EB] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                                Frust.
                            </TableHead>
                            <TableHead className="h-auto border-b border-[#E5E7EB] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                                Highlights
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="px-6 py-14 text-center text-sm text-[#8B8796]">
                                    No conversations match these filters.
                                </TableCell>
                            </TableRow>
                        )}

                        {items.map((item) => {
                            const isSelected = selectedGradeId === item.grade_id;
                            return (
                                <TableRow
                                    key={item.grade_id}
                                    onClick={() => onSelect(item.grade_id)}
                                    className={cn(
                                        'cursor-pointer border-b border-[#E5E7EB] transition-colors',
                                        isSelected ? 'bg-[#EFF6FF] hover:bg-[#EFF6FF]' : 'bg-white hover:bg-[#FAFAF8]',
                                        item.highlights.length > 0 && !isSelected && 'border-l-[3px] border-l-[#FACC15]/70',
                                        isSelected && 'border-l-[3px] border-l-[#2563EB]',
                                    )}
                                >
                                    <TableCell className="px-5 py-4">
                                        <div className="min-w-0 space-y-1">
                                            <div className="truncate text-[13px] font-semibold text-[#1A1917]">
                                                {item.contact_name ?? 'Anonymous'}
                                            </div>
                                            <div className="text-[10px] font-medium text-[#9C9889]">
                                                {formatDateLabel(item.grade_date)}
                                                {item.message_count > 0 ? ` · ${item.message_count} messages` : ''}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-[13px] text-[#6B7280]">
                                        {item.intent_label ?? 'Unknown'}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center">
                                        <ResolutionCell value={item.resolution} />
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center">
                                        <ScoreCell value={item.frustration_score} inverted />
                                    </TableCell>
                                    <TableCell className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.highlights.length > 0 ? (
                                                item.highlights.map((highlight) => (
                                                    <HighlightBadge key={highlight.code} code={highlight.code} label={highlight.label} />
                                                ))
                                            ) : (
                                                <span className="text-[11px] text-[#B0AAA0]">None</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3 text-[11px] font-medium text-[#8B8796]">
                <span>{total > 0 ? `${start} - ${end} of ${total}` : '0 results'}</span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E8E5DF] bg-[#F7F5F2] px-3 py-1.5 text-[12px] text-[#1A1917] transition-colors hover:bg-[#F0EDE8] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Prev
                    </button>
                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E8E5DF] bg-white px-3 py-1.5 text-[12px] text-[#1A1917] transition-colors hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
