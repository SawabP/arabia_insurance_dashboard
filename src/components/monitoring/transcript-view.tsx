import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TranscriptMessage } from '@/lib/monitoring-types';
import { cn } from '@/lib/utils';

interface TranscriptViewProps {
    messages: TranscriptMessage[];
}

function isInbound(role: string): boolean {
    const lower = role.toLowerCase();
    return lower.includes('customer') || lower.includes('user') || lower.includes('inbound');
}

function formatTime(value: string) {
    try {
        return format(parseISO(value), 'HH:mm');
    } catch {
        return '';
    }
}

function roleLabel(role: string) {
    if (isInbound(role)) return 'Customer';
    if (role.toLowerCase().includes('assistant') || role.toLowerCase().includes('bot')) return 'Assistant';
    return role;
}

export function TranscriptView({ messages }: TranscriptViewProps) {
    if (messages.length === 0) {
        return (
            <div className="flex h-full items-center justify-center px-6 py-16">
                <p className="text-sm text-[#8B8796]">No transcript is available for this conversation.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex min-h-full flex-col gap-4 px-6 py-5">
                {messages.map((message, index) => {
                    const inbound = isInbound(message.role);
                    const time = formatTime(message.created_at);

                    return (
                        <div
                            key={`${message.created_at}-${index}`}
                            className={cn('flex flex-col gap-1', inbound ? 'items-start' : 'items-end')}
                        >
                            <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9C9889]">
                                {roleLabel(message.role)}
                            </span>
                            <div
                                className={cn(
                                    'max-w-[78%] rounded-2xl px-4 py-3 text-[13px] leading-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
                                    inbound
                                        ? 'rounded-tl-sm border border-[#F0EDE8] bg-[#FAFAF8] text-[#1A1917]'
                                        : 'rounded-tr-sm border border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A8A]',
                                )}
                            >
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            {time && <span className="px-1 text-[10px] font-medium text-[#B0AAA0]">{time}</span>}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
