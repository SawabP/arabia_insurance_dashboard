import React from 'react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TranscriptMessage } from '@/lib/monitoring-types';

interface TranscriptViewProps {
    messages: TranscriptMessage[];
}

function isInbound(role: string): boolean {
    const lower = role.toLowerCase();
    return (
        lower.includes('customer') ||
        lower.includes('user') ||
        lower.includes('inbound')
    );
}

export function TranscriptView({ messages }: TranscriptViewProps) {
    if (messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground text-sm">No transcript available.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px]">
            <div className="flex flex-col gap-3 p-4 h-[400px] overflow-y-auto">
                {messages.map((message, index) => {
                    const inbound = isInbound(message.role);

                    let formattedTime = '';
                    try {
                        formattedTime = format(parseISO(message.created_at), 'HH:mm');
                    } catch {
                        formattedTime = '';
                    }

                    return (
                        <div
                            key={index}
                            className={cn(
                                'flex flex-col max-w-[75%]',
                                inbound ? 'items-start self-start' : 'items-end self-end'
                            )}
                        >
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 px-1">
                                {message.role}
                            </span>
                            <div
                                className={cn(
                                    'px-3 py-2 text-sm leading-relaxed',
                                    inbound
                                        ? 'bg-muted rounded-2xl rounded-tl-none'
                                        : 'bg-primary/10 rounded-2xl rounded-tr-none'
                                )}
                            >
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            {formattedTime && (
                                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                    {formattedTime}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
