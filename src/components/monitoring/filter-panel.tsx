'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { MonitoringFilters } from '@/lib/monitoring-types';

const INTENT_TAXONOMY = [
    { category: 'Policy Related', intents: [
        { code: 'policy_inquiry', label: 'Policy Inquiry' },
        { code: 'policy_purchase', label: 'Policy Purchase' },
        { code: 'policy_modification', label: 'Policy Modification' },
        { code: 'policy_cancellation', label: 'Policy Cancellation' },
    ]},
    { category: 'Claims Related', intents: [
        { code: 'claims_submission', label: 'Claims Submission' },
        { code: 'claims_followup', label: 'Claims Follow-up' },
        { code: 'claims_dispute', label: 'Claims Dispute' },
    ]},
    { category: 'Billing & Payments', intents: [
        { code: 'payment_inquiry', label: 'Payment Inquiry' },
        { code: 'payment_issue', label: 'Payment Issue' },
    ]},
    { category: 'Support & Complaints', intents: [
        { code: 'general_inquiry', label: 'General Inquiry' },
        { code: 'complaint', label: 'Complaint' },
        { code: 'escalation_request', label: 'Escalation Request' },
    ]},
    { category: 'Non-genuine', intents: [
        { code: 'wasteful', label: 'Wasteful' },
    ]},
];

interface FilterPanelProps {
    filters: MonitoringFilters;
    onChange: (filters: MonitoringFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
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

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 border-b bg-muted/20">
            {/* Date range */}
            <div className="flex items-center gap-1.5">
                <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => update({ start_date: e.target.value })}
                    className="h-8 text-xs w-[130px]"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => update({ end_date: e.target.value })}
                    className="h-8 text-xs w-[130px]"
                />
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Resolution */}
            <Select
                value={filters.resolution === null ? 'all' : String(filters.resolution)}
                onValueChange={(v) => update({ resolution: v === 'all' ? null : v === 'true' })}
            >
                <SelectTrigger className="h-8 text-xs w-[130px]">
                    <SelectValue placeholder="Resolution" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All resolutions</SelectItem>
                    <SelectItem value="true">Resolved</SelectItem>
                    <SelectItem value="false">Unresolved</SelectItem>
                </SelectContent>
            </Select>

            {/* Escalation types */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">Escalation:</span>
                {['Natural', 'Failure'].map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                            checked={filters.escalation_types.includes(type)}
                            onCheckedChange={() => toggleEscalation(type)}
                            className="h-3.5 w-3.5"
                        />
                        <span className={type === 'Failure' ? 'text-red-600' : 'text-teal-600'}>{type}</span>
                    </label>
                ))}
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Frustration min */}
            <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-medium">Frust. &ge;</span>
                <Input
                    type="number"
                    min={1} max={10}
                    value={filters.frustration_min ?? ''}
                    onChange={(e) => update({ frustration_min: e.target.value ? Number(e.target.value) : null })}
                    className="h-8 text-xs w-14 text-center"
                    placeholder="—"
                />
            </div>

            {/* Accuracy max */}
            <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-medium">Acc. &le;</span>
                <Input
                    type="number"
                    min={1} max={10}
                    value={filters.accuracy_max ?? ''}
                    onChange={(e) => update({ accuracy_max: e.target.value ? Number(e.target.value) : null })}
                    className="h-8 text-xs w-14 text-center"
                    placeholder="—"
                />
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Intent multi-select (collapsible) */}
            <Select
                value={filters.intent_codes[0] ?? ''}
                onValueChange={(v) => toggleIntent(v)}
            >
                <SelectTrigger className="h-8 text-xs w-[150px]">
                    <SelectValue placeholder={filters.intent_codes.length ? `${filters.intent_codes.length} intent(s)` : 'All intents'} />
                </SelectTrigger>
                <SelectContent>
                    {INTENT_TAXONOMY.map((group) => (
                        <div key={group.category}>
                            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {group.category}
                            </div>
                            {group.intents.map((intent) => (
                                <div
                                    key={intent.code}
                                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-muted text-sm"
                                    onClick={(e) => { e.preventDefault(); toggleIntent(intent.code); }}
                                >
                                    <Checkbox
                                        checked={filters.intent_codes.includes(intent.code)}
                                        onCheckedChange={() => toggleIntent(intent.code)}
                                        className="h-3.5 w-3.5"
                                    />
                                    {intent.label}
                                </div>
                            ))}
                        </div>
                    ))}
                </SelectContent>
            </Select>

            {/* Highlights only toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer">
                <Switch
                    checked={filters.highlights_only}
                    onCheckedChange={(v) => update({ highlights_only: v })}
                    className="scale-75"
                />
                <span className={`text-xs font-medium ${filters.highlights_only ? 'text-red-600' : 'text-muted-foreground'}`}>
                    Highlights only
                </span>
            </label>

            <div className="ml-auto flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-medium">Sort:</span>
                <Select
                    value={filters.sort_by ?? ''}
                    onValueChange={(v) => update({ sort_by: v || null })}
                >
                    <SelectTrigger className="h-8 text-xs w-[150px]">
                        <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Default</SelectItem>
                        <SelectItem value="frustration_score">Frustration</SelectItem>
                        <SelectItem value="accuracy_score">Accuracy</SelectItem>
                    </SelectContent>
                </Select>
                <button
                    onClick={() => update({ sort_direction: filters.sort_direction === 'asc' ? 'desc' : 'asc' })}
                    className="h-8 px-2 rounded-md border text-xs text-muted-foreground hover:bg-muted"
                >
                    {filters.sort_direction === 'asc' ? '↑' : '↓'}
                </button>
            </div>
        </div>
    );
}
