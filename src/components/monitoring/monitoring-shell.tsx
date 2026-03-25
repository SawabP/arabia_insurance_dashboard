'use client';

import { useState, useCallback, useTransition } from 'react';
import type { MonitoringListResponse, MonitoringConversationDetail, MonitoringFilters } from '@/lib/monitoring-types';
import { listMonitoringConversations, getMonitoringDetail } from '@/app/actions/monitoring';
import { FilterPanel } from './filter-panel';
import { ConversationTable } from './conversation-table';
import { ConversationDetail } from './conversation-detail';
import { Skeleton } from '@/components/ui/skeleton';

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
        sort_by: 'grade_date',
        sort_direction: 'desc',
    });

    const [items, setItems] = useState(initialData.items);
    const [total, setTotal] = useState(initialData.total);
    const [page, setPage] = useState(1);
    const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
    const [detail, setDetail] = useState<MonitoringConversationDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [listPending, startListTransition] = useTransition();
    const freshness = initialData.freshness;

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
            } catch {
                // silently keep old data on error
            }
        });
    }, []);

    const handleFiltersChange = (newFilters: MonitoringFilters) => {
        setFilters(newFilters);
        setPage(1);
        setSelectedGradeId(null);
        setDetail(null);
        fetchList(newFilters, 1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchList(filters, newPage);
    };

    const handleSelectConversation = async (gradeId: string) => {
        if (gradeId === selectedGradeId) return;
        setSelectedGradeId(gradeId);
        setDetailLoading(true);
        try {
            const res = await getMonitoringDetail(gradeId);
            setDetail(res.detail);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-[calc(100vh-7rem)] overflow-hidden">
            {/* Freshness */}
            {freshness.latest_successful_window_end_date && (
                <div className="flex items-center gap-1.5 px-4 pt-1 text-[11px] text-muted-foreground">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    Data through {freshness.latest_successful_window_end_date}
                </div>
            )}

            <FilterPanel filters={filters} onChange={handleFiltersChange} />

            <div className="flex flex-1 overflow-hidden">
                {/* Left: conversation list */}
                <div className={`flex flex-col border-r transition-opacity ${listPending ? 'opacity-60' : ''} ${detail ? 'w-[520px] flex-shrink-0' : 'flex-1'}`}>
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

                {/* Right: detail panel */}
                {(detail || detailLoading) && (
                    <div className="flex-1 overflow-hidden">
                        {detailLoading ? (
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-[300px] w-full" />
                            </div>
                        ) : detail ? (
                            <ConversationDetail detail={detail} />
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
