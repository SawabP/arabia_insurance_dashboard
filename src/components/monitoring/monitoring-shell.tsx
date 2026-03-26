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

    useEffect(() => {
        if (!selectedGradeId) return;
        void loadDetail(selectedGradeId);
    }, [loadDetail, selectedGradeId]);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="px-10 pt-5">
                <FilterPanel filters={filters} onChange={handleFiltersChange} />
            </div>

            <div className="relative flex min-h-0 flex-1 gap-6 px-10 pb-8 pt-5">
                {/* Conversation list — hidden when detail is expanded */}
                <div
                    className={cn(
                        'min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-opacity',
                        listPending && 'opacity-65',
                        detail || detailLoading ? 'basis-[42%]' : 'flex-1',
                        detailExpanded && 'invisible',
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

                {/* Detail panel */}
                {(detail || detailLoading) && (
                    <div
                        className={cn(
                            'overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition-all duration-200',
                            detailExpanded
                                ? 'absolute inset-0 mx-10 mb-8 mt-5 z-10'
                                : 'min-w-0 flex-1',
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
                                onToggleExpand={() => setDetailExpanded((v) => !v)}
                            />
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
