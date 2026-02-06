
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function DateRangePicker() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to Last 30 Days if no params
    const defaultStart = searchParams.get('startDate') || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const defaultEnd = searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd');

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [isOpen, setIsOpen] = useState(false);

    // Update local state when URL params change
    useEffect(() => {
        if (!searchParams.get('startDate')) {
            // Apply default 30 days if URL is empty
            setStartDate(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
            setEndDate(format(new Date(), 'yyyy-MM-dd'));
        } else {
            setStartDate(searchParams.get('startDate') || '');
            setEndDate(searchParams.get('endDate') || '');
        }
    }, [searchParams]);

    const handleApply = useCallback((start: string, end: string) => {
        const params = new URLSearchParams(searchParams);
        if (start) params.set('startDate', start);
        else params.delete('startDate');

        if (end) params.set('endDate', end);
        else params.delete('endDate');

        router.push(`?${params.toString()}`);
        setIsOpen(false);
    }, [router, searchParams]);

    const applyPreset = (preset: '7days' | '30days' | 'thisMonth' | 'lastMonth') => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (preset) {
            case '7days':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
        }

        const s = format(start, 'yyyy-MM-dd');
        const e = format(end, 'yyyy-MM-dd');
        setStartDate(s);
        setEndDate(e);
        handleApply(s, e);
    };

    const handleClear = useCallback(() => {
        setStartDate('');
        setEndDate('');
        const params = new URLSearchParams(searchParams);
        params.delete('startDate');
        params.delete('endDate');
        router.push(`?${params.toString()}`);
        setIsOpen(false);
    }, [router, searchParams]);

    const displayLabel = startDate && endDate
        ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`
        : 'Select Date Range';

    return (
        <div className="relative">
            <Button
                variant="outline"
                className="gap-2 min-w-[260px] justify-start text-left font-normal"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar className="h-4 w-4" />
                <span>{displayLabel}</span>
            </Button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 w-[420px] rounded-lg border bg-card p-0 shadow-xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
                    <div className="flex h-full">
                        {/* Presets Sidebar */}
                        <div className="w-[140px] bg-muted/30 border-r p-3 flex flex-col gap-2">
                            <span className="text-xs font-semibold text-muted-foreground mb-1 px-2">Presets</span>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8 px-2 font-normal" onClick={() => applyPreset('7days')}>Last 7 Days</Button>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8 px-2 font-normal" onClick={() => applyPreset('30days')}>Last 30 Days</Button>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8 px-2 font-normal" onClick={() => applyPreset('thisMonth')}>This Month</Button>
                            <Button variant="ghost" size="sm" className="justify-start text-xs h-8 px-2 font-normal" onClick={() => applyPreset('lastMonth')}>Last Month</Button>
                        </div>

                        {/* Custom Range */}
                        <div className="flex-1 p-4 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                                    <input
                                        type="date"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">End Date</label>
                                    <input
                                        type="date"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t mt-4">
                                <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-foreground h-8 px-2">
                                    Reset
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-8">
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={() => handleApply(startDate, endDate)} className="h-8">
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
}
