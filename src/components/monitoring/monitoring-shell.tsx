'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { MonitoringListResponse, MonitoringConversationDetail, MonitoringFilters } from '@/lib/monitoring-types';
import { listMonitoringConversations, getMonitoringDetail } from '@/app/actions/monitoring';
import { FilterPanel } from './filter-panel';
import { ConversationTable } from './conversation-table';
import { ConversationDetail } from './conversation-detail';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const LIMIT = 50;

interface MonitoringShellProps {
    initialData: MonitoringListResponse;
    initialStartDate: string;
    initialEndDate: string;
}

function formatHeaderDate(value?: string | null): string | null {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
}

export function MonitoringShell({ initialData, initialStartDate, initialEndDate }: MonitoringShellProps) {
    const [filters, setFilters] = useState<MonitoringFilters>({
        start_date: initialStartDate,
        end_date: initialEndDate,
        resolution: null,
        escalation_types: [],
        frustration_min: null,
        accuracy_max: null,
        intent_codes: [],
        highlights_only: false,
        sort_by: null,
        sort_direction: 'desc',
    });

    const [items, setItems] = useState(initialData.items);
    const [total, setTotal] = useState(initialData.total);
    const [page, setPage] = useState(1);
    const [selectedGradeId, setSelectedGradeId] = useState<string | null>(initialData.items[0]?.grade_id ?? null);
    const [detail, setDetail] = useState<MonitoringConversationDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(Boolean(initialData.items[0]));
    const [detailExpanded, setDetailExpanded] = useState(false);
    const [listPending, startListTransition] = useTransition();
    const freshnessDate = formatHeaderDate(initialData.freshness.latest_successful_window_end_date);
    const showDetail = Boolean(detail || detailLoading);

    const loadDetail = useCallback(async (gradeId: string) => {
        setDetailLoading(true);
        try {
            const res = await getMonitoringDetail(gradeId);
            setDetail(res.detail);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const fetchList = useCallback((newFilters: MonitoringFilters, newPage: number) => {
        startListTransition(async () => {
            const params: Parameters<typeof listMonitoringConversations>[0] = {
                start_date: newFilters.start_date,
                end_date: newFilters.end_date,
                sort_by: newFilters.sort_by ?? undefined,
                sort_direction: newFilters.sort_direction,
                limit: LIMIT,
                offset: (newPage - 1) * LIMIT,
            };

            if (newFilters.resolution !== null) params.resolution = newFilters.resolution;
            if (newFilters.frustration_min !== null) params.frustration_min = newFilters.frustration_min;
            if (newFilters.accuracy_max !== null) params.accuracy_max = newFilters.accuracy_max;
            if (newFilters.escalation_types.length) params.escalation_types = newFilters.escalation_types;
            if (newFilters.intent_codes.length) params.intent_codes = newFilters.intent_codes;

            // Approximate highlights_only with server-side thresholds
            if (newFilters.highlights_only) {
                params.frustration_min = params.frustration_min ?? 7;
                params.accuracy_max = params.accuracy_max ?? 3;
            }

            try {
                const res = await listMonitoringConversations(params);
                setItems(res.items);
                setTotal(res.total);
                setSelectedGradeId(res.items[0]?.grade_id ?? null);
                if (res.items.length === 0) {
                    setDetail(null);
                    setDetailLoading(false);
                }
            } catch {
                // silently keep old data on error
            }
        });
    }, []);

    const handleFiltersChange = (newFilters: MonitoringFilters) => {
        setFilters(newFilters);
        setPage(1);
        fetchList(newFilters, 1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchList(filters, newPage);
    };

    const handleSelectConversation = (gradeId: string) => {
        if (gradeId === selectedGradeId) return;
        setSelectedGradeId(gradeId);
        setDetailExpanded(false);
    };

    const handleToggleExpand = () => {
        setDetailExpanded((value) => !value);
    };

    useEffect(() => {
        if (!selectedGradeId) return;
        void loadDetail(selectedGradeId);
    }, [loadDetail, selectedGradeId]);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#FAFAFA]">
            <div
                className={cn(
                    'grid min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-x-6 px-10 pb-8 pt-8',
                    showDetail ? 'grid-cols-[minmax(0,42%)_minmax(0,1fr)]' : 'grid-cols-1',
                )}
            >
                <div className={cn(showDetail && detailExpanded ? 'col-start-1' : 'col-span-full')}>
                    <div className="space-y-3">
                        <h1 className="text-[2.25rem] font-extrabold tracking-[-0.04em] text-[#1A1917]">
                            Conversations Monitoring
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#8B8796]">
                            {freshnessDate && (
                                <>
                                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
                                    <span>Data through {freshnessDate}</span>
                                    <span className="h-3 w-px bg-[#E8E5DF]" />
                                </>
                            )}
                            <span>{total.toLocaleString()} conversations</span>
                        </div>
                    </div>
                </div>

                <div className={cn('pt-5', showDetail && detailExpanded ? 'col-start-1' : 'col-span-full')}>
                    <FilterPanel filters={filters} onChange={handleFiltersChange} />
                </div>

                <div
                    className={cn(
                        'mt-5 min-h-0 min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-opacity',
                        showDetail ? 'col-start-1 row-start-3' : 'col-span-full row-start-3',
                        listPending && 'opacity-65',
                    )}
                >
                    <ConversationTable
                        items={items}
                        selectedGradeId={selectedGradeId}
                        onSelect={handleSelectConversation}
                        total={total}
                        page={page}
                        limit={LIMIT}
                        onPageChange={handlePageChange}
                    />
                </div>

                {showDetail && (
                    <div
                        className={cn(
                            'min-h-0 min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-shadow duration-200',
                            detailExpanded ? 'col-start-2 row-[1/4]' : 'col-start-2 row-start-3 mt-5',
                        )}
                    >
                        {detailLoading ? (
                            <div className="space-y-4 p-6">
                                <Skeleton className="h-7 w-56" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-6 w-64" />
                                <Skeleton className="h-[360px] w-full rounded-2xl" />
                            </div>
                        ) : detail ? (
                            <ConversationDetail
                                detail={detail}
                                expanded={detailExpanded}
                                onToggleExpand={handleToggleExpand}
                            />
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
