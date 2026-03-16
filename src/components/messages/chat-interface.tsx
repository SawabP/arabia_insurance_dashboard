'use client';

import { useEffect, useState } from 'react';
import { Conversation, Message, getConversationMessages, getConversations } from '@/app/actions/messages';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FileIcon, MapPin, MessageSquare, PlayIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientOnlyDate } from '@/components/client-only-date';

interface ChatInterfaceProps {
    initialConversations: Conversation[];
    initialTotalCount: number;
}

export function ChatInterface({ initialConversations, initialTotalCount }: ChatInterfaceProps) {
    const [selectedConversationKey, setSelectedConversationKey] = useState<string | null>(initialConversations[0]?.conversationKey || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [convLoading, setConvLoading] = useState(false);
    const [conversations, setConversations] = useState(initialConversations);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [page, setPage] = useState(1);

    const limit = 20;

    useEffect(() => {
        if (!selectedConversationKey && initialConversations[0]) {
            setSelectedConversationKey(initialConversations[0].conversationKey);
        }
    }, [initialConversations, selectedConversationKey]);

    useEffect(() => {
        if (!selectedConversationKey) {
            setMessages([]);
            return;
        }

        setLoading(true);
        getConversationMessages(selectedConversationKey).then((items) => {
            setMessages(items);
            setLoading(false);
        });
    }, [selectedConversationKey]);

    const handlePageChange = async (newPage: number) => {
        setConvLoading(true);
        const result = await getConversations(newPage, limit);
        setConversations(result.conversations);
        setTotalCount(result.totalCount);
        setPage(newPage);
        setConvLoading(false);

        if (!result.conversations.some((conversation) => conversation.conversationKey === selectedConversationKey)) {
            setSelectedConversationKey(result.conversations[0]?.conversationKey || null);
        }
    };

    const selectedConversation = conversations.find((conversation) => conversation.conversationKey === selectedConversationKey);
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="w-96 border-r border-border/30 flex flex-col">
                <div className="p-4 border-b border-border/30 space-y-2">
                    <h2 className="font-semibold text-lg">Messages</h2>
                    <p className="text-sm text-muted-foreground">
                        Latest conversations returned by the backend conversation list endpoint.
                    </p>
                </div>
                <ScrollArea className="flex-1">
                    <div className={cn("flex flex-col gap-1 p-2", convLoading && "opacity-50 pointer-events-none")}>
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.conversationKey}
                                onClick={() => setSelectedConversationKey(conversation.conversationKey)}
                                className={cn(
                                    "flex items-start gap-3 py-4 pl-4 pr-3 text-start transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border/40 last:border-0",
                                    selectedConversationKey === conversation.conversationKey && "bg-slate-100 dark:bg-slate-800 border-transparent"
                                )}
                            >
                                <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                                    <AvatarFallback className="font-semibold text-sm bg-indigo-100 text-indigo-700">
                                        {conversation.contactName?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-foreground text-[15px] truncate pr-2">
                                            {conversation.contactName || conversation.conversationKey}
                                        </span>
                                        <span className="text-[11px] font-medium text-muted-foreground/70 whitespace-nowrap">
                                            {conversation.latestMessageAt && <ClientOnlyDate date={conversation.latestMessageAt} />}
                                        </span>
                                    </div>
                                    <p dir="auto" className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed break-words w-full">
                                        {conversation.latestMessage || 'No message preview available.'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-3 border-t flex items-center justify-between bg-muted/10">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Page {page} of {totalPages || 1}</span>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={page <= 1 || convLoading}
                            onClick={() => handlePageChange(page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={page >= totalPages || convLoading}
                            onClick={() => handlePageChange(page + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative">
                {selectedConversation ? (
                    <>
                        <div className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{selectedConversation.contactName?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">{selectedConversation.contactName || selectedConversation.conversationKey}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedConversation.channel || 'Unknown channel'}</p>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="flex flex-col gap-4">
                                {messages.filter((message) => message.message).map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex flex-col gap-1 px-5 py-3.5 text-[15px] shadow-sm max-w-[85%] leading-relaxed",
                                            message.direction === 'outbound'
                                                ? "ml-auto bg-primary text-primary-foreground rounded-[20px] rounded-tr-md"
                                                : "bg-white dark:bg-card border-none rounded-[20px] rounded-tl-md text-foreground"
                                        )}
                                    >
                                        {(() => {
                                            const rawMessage = message.message || '';
                                            const parts = rawMessage.split(/ [–-] /);
                                            const url = parts.length > 1 ? parts[parts.length - 1] : rawMessage;
                                            const fileName = parts.length > 1
                                                ? parts.slice(0, parts.length - 1).join(' - ')
                                                : (url.split('/').pop()?.split('?')[0] || 'Attachment');

                                            if (message.messageType === 'image' || message.messageType === 'sticker') {
                                                return (
                                                    <div className="relative group">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={url}
                                                            alt={fileName}
                                                            title={fileName}
                                                            className="rounded-lg max-h-64 max-w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                                            onClick={() => window.open(url, '_blank')}
                                                        />
                                                        {parts.length > 1 && <div className="text-xs mt-1 opacity-70 truncate max-w-[200px]">{fileName}</div>}
                                                    </div>
                                                );
                                            }

                                            if (message.messageType === 'file' || message.messageType === 'audio' || message.messageType === 'video') {
                                                return (
                                                    <div className="flex items-center gap-3 p-1">
                                                        <div className={cn(
                                                            "p-2.5 rounded-xl shrink-0",
                                                            message.direction === 'outbound' ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                                                        )}>
                                                            {message.messageType === 'audio' ? <PlayIcon className="h-5 w-5" /> :
                                                                message.messageType === 'video' ? <Video className="h-5 w-5" /> :
                                                                    <FileIcon className="h-5 w-5" />}
                                                        </div>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={cn(
                                                                "text-sm underline underline-offset-2 break-all line-clamp-2 hover:opacity-80",
                                                                message.direction === 'outbound' ? "text-primary-foreground" : "text-blue-600 dark:text-blue-400"
                                                            )}
                                                        >
                                                            {fileName}
                                                        </a>
                                                    </div>
                                                );
                                            }

                                            if (message.messageType === 'location') {
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <a href={`https://www.google.com/maps/search/?api=1&query=${url}`} target="_blank" rel="noopener noreferrer" className="underline">
                                                            View Location
                                                        </a>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <p className="whitespace-pre-wrap break-words">
                                                    {rawMessage}
                                                </p>
                                            );
                                        })()}
                                        <span className={cn(
                                            "text-[10px] self-end opacity-70 mt-1 font-medium",
                                            message.direction === 'outbound' ? "text-primary-foreground" : "text-muted-foreground"
                                        )}>
                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                                {loading && <div className="text-center text-sm text-muted-foreground animate-pulse">Loading conversation...</div>}
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-semibold text-foreground">Conversation Viewer</h3>
                            <p className="max-w-[250px] text-sm">Select a conversation from the sidebar to view detailed message history.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
