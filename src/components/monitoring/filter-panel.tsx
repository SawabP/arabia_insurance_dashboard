'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Calendar, ListFilter, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { MonitoringFilters } from '@/lib/monitoring-types';
import { cn } from '@/lib/utils';

const INTENT_TAXONOMY = [
    {
        category: 'Policy Related',
        intents: [
            { code: 'policy_inquiry', label: 'Policy Inquiry' },
            { code: 'policy_purchase', label: 'Policy Purchase' },
            { code: 'policy_modification', label: 'Policy Modification' },
            { code: 'policy_cancellation', label: 'Policy Cancellation' },
        ],
    },
    {
        category: 'Claims Related',
        intents: [
            { code: 'claims_submission', label: 'Claims Submission' },
            { code: 'claims_followup', label: 'Claims Follow-up' },
            { code: 'claims_dispute', label: 'Claims Dispute' },
        ],
    },
    {
        category: 'Billing & Payments',
        intents: [
            { code: 'payment_inquiry', label: 'Payment Inquiry' },
            { code: 'payment_issue', label: 'Payment Issue' },
        ],
    },
    {
        category: 'Documents & Admin',
        intents: [
            { code: 'document_request', label: 'Document Request' },
            { code: 'account_profile_update', label: 'Account/Profile Update' },
        ],
    },
    {
        category: 'Support & Complaints',
        intents: [
            { code: 'general_inquiry', label: 'General Inquiry' },
            { code: 'complaint', label: 'Complaint' },
            { code: 'escalation_request', label: 'Handover Request' },
        ],
    },
    {
        category: 'Non-genuine',
        intents: [{ code: 'wasteful', label: 'Wasteful' }],
    },
];

interface FilterPanelProps {
    filters: MonitoringFilters;
    onChange: (filters: MonitoringFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
    const [open, setOpen] = useState(false);
    const update = (partial: Partial<MonitoringFilters>) => onChange({ ...filters, ...partial });

    const toggleEscalation = (type: string) => {
        const next = filters.escalation_types.includes(type)
            ? filters.escalation_types.filter((t) => t !== type)
            : [...filters.escalation_types, type];
        update({ escalation_types: next });
    };

    const toggleIntent = (code: string) => {
        const next = filters.intent_codes.includes(code)
            ? filters.intent_codes.filter((c) => c !== code)
            : [...filters.intent_codes, code];
        update({ intent_codes: next });
    };

    // Count active non-date filters
    const activeCount = useMemo(() => [
        filters.resolution !== null,
        filters.escalation_types.length > 0,
        filters.frustration_min !== null,
        filters.accuracy_max !== null,
        filters.intent_codes.length > 0,
        filters.highlights_only,
        filters.sort_by !== null,
    ].filter(Boolean).length, [filters]);

    const clearAll = () => onChange({
        ...filters,
        resolution: null,
        escalation_types: [],
        frustration_min: null,
        accuracy_max: null,
        intent_codes: [],
        highlights_only: false,
        sort_by: null,
        sort_direction: 'desc',
    });

    return (
        <div className="flex items-center gap-3">
            {/* Date range — always visible */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-[#9C9889]" />
                <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => update({ start_date: e.target.value })}
                    className="h-auto w-[110px] border-0 bg-transparent px-0 py-0 text-[12px] font-semibold text-[#1A1917] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <span className="text-[#C4C0B6]">–</span>
                <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => update({ end_date: e.target.value })}
                    className="h-auto w-[110px] border-0 bg-transparent px-0 py-0 text-[12px] font-semibold text-[#1A1917] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>

            {/* Filters & Sort toggle */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors',
                        activeCount > 0
                            ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                            : 'border-[#E5E7EB] bg-white text-[#6B6960] hover:border-[#D1D5DB] hover:text-[#1A1917]',
                    )}
                >
                    <ListFilter className="h-3.5 w-3.5" />
                    Filters &amp; Sort
                    {activeCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                </button>

                {open && (
                    <>
                        {/* Backdrop */}
                        <button
                            type="button"
                            aria-label="Close filters"
                            className="fixed inset-0 z-20 cursor-default"
                            onClick={() => setOpen(false)}
                        />

                        {/* Panel */}
                        <div className="absolute left-0 top-[calc(100%+0.625rem)] z-30 w-[540px] rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_40px_rgba(17,24,39,0.12)] flex flex-col max-h-[calc(100vh-12rem)]">
                            {/* Header — sticky */}
                            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F3F4F6]">
                                <span className="text-[13px] font-semibold text-[#1A1917]">Filters &amp; Sort</span>
                                {activeCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="text-[11px] font-semibold text-[#9C9889] hover:text-[#1A1917] transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Scrollable grid */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                {/* Resolution */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9C9889]">Resolution</label>
                                    <Select
                                        value={filters.resolution === null ? 'all' : String(filters.resolution)}
                                        onValueChange={(v: string) => update({ resolution: v === 'all' ? null : v === 'true' })}
                                    >
                                        <SelectTrigger className="h-9 rounded-xl border-[#E5E7EB] text-[13px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="true">Resolved</SelectItem>
                                            <SelectItem value="false">Unresolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Escalation */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9C9889]">Handover type</label>
                                    <div className="flex gap-2">
                                        {['Natural', 'Failure'].map((type) => {
                                            const active = filters.escalation_types.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => toggleEscalation(type)}
                                                    className={cn(
                                                        'flex-1 rounded-xl border py-2 text-[12px] font-semibold transition-colors',
                                                        active
                                                            ? type === 'Failure'
                                                                ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]'
                                                                : 'border-[#93C5FD] bg-[#EFF6FF] text-[#2563EB]'
                                                            : 'border-[#E5E7EB] bg-[#FAFAF8] text-[#6B6960] hover:border-[#D1D5DB]',
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Frustration */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9C9889]">
                                        Frustration &ge;
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={filters.frustration_min ?? ''}
                                            onChange={(e) => update({ frustration_min: e.target.value ? Number(e.target.value) : null })}
                                            placeholder="Any"
                                            className="h-9 rounded-xl border-[#E5E7EB] text-[13px]"
                                        />
                                        {filters.frustration_min !== null && (
                                            <button type="button" onClick={() => update({ frustration_min: null })} className="text-[#9C9889] hover:text-[#1A1917]">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Accuracy */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9C9889]">
                                        Accuracy &le;
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={filters.accuracy_max ?? ''}
                                            onChange={(e) => update({ accuracy_max: e.target.value ? Number(e.target.value) : null })}
                                            placeholder="Any"
                                            className="h-9 rounded-xl border-[#E5E7EB] text-[13px]"
                                        />
                                        {filters.accuracy_max !== null && (
                                            <button type="button" onClick={() => update({ accuracy_max: null })} className="text-[#9C9889] hover:text-[#1A1917]">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Intent — spans both columns */}
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9C9889]">Intent</label>
                                    <div className="grid grid-cols-2 gap-x-6">
                                        {INTENT_TAXONOMY.map((group) => (
                                            <div key={group.category} className="mb-3">
                                                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#C4C0B6]">
                                                    {group.category}
                                                </div>
                                                <div className="space-y-1">
                                                    {group.intents.map((intent) => {
                                                        const checked = filters.intent_codes.includes(intent.code);
                                                        return (
                                                            <label
                                                                key={intent.code}
                                                                className={cn(
                                                                    'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-colors',
                                                                    checked ? 'bg-[#F7FAFF] text-[#1A1917]' : 'text-[#4B5563] hover:bg-[#FAFAF8]',
                                                                )}
                                                            >
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onCheckedChange={() => toggleIntent(intent.code)}
                                                                    className="h-3.5 w-3.5"
                                                                />
                                                                {intent.label}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Highlights only — spans both columns */}
                                <div className="col-span-2 flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
                                    <div>
                                        <div className="text-[13px] font-semibold text-[#1A1917]">Highlights only</div>
                                        <div className="text-[11px] text-[#9C9889]">Show conversations with at least one AI-flagged issue</div>
                                    </div>
                                    <Switch
                                        checked={filters.highlights_only}
                                        onCheckedChange={(checked: boolean) => update({ highlights_only: checked })}
                                        className="data-[state=checked]:bg-[#E24B4A]"
                                    />
                                </div>
                            </div>
                            </div>

                            {/* Sort — sticky footer */}
                            <div className="flex-shrink-0 border-t border-[#F3F4F6] px-5 py-4 flex items-center gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9C9889]">Sort by</span>
                                <Select
                                    value={filters.sort_by ?? 'default'}
                                    onValueChange={(v: string) => update({ sort_by: v === 'default' ? null : v })}
                                >
                                    <SelectTrigger className="h-9 flex-1 rounded-xl border-[#E5E7EB] text-[13px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default order</SelectItem>
                                        <SelectItem value="frustration_score">Frustration score</SelectItem>
                                        <SelectItem value="accuracy_score">Accuracy score</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    type="button"
                                    onClick={() => update({ sort_direction: filters.sort_direction === 'asc' ? 'desc' : 'asc' })}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] text-[#6B6960] transition-colors hover:border-[#D1D5DB] hover:text-[#1A1917]"
                                    aria-label={filters.sort_direction === 'asc' ? 'Sort descending' : 'Sort ascending'}
                                >
                                    {filters.sort_direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
