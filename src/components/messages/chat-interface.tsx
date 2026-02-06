'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, getCustomerMessages, getConversations } from '@/app/actions/messages';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Search, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles, Loader2, X, AlertCircle, FileIcon, ImageIcon, PlayIcon, MapPin, Sticker, Video } from 'lucide-react';
import { analyzeConversation, AIAnalysisResult } from '@/app/actions/ai-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientOnlyDate } from '@/components/client-only-date';

interface ChatInterfaceProps {
    initialConversations: Conversation[];
    initialTotalCount: number;
}

export function ChatInterface({ initialConversations, initialTotalCount }: ChatInterfaceProps) {
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [convLoading, setConvLoading] = useState(false);
    const [conversations, setConversations] = useState(initialConversations);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const limit = 20;

    const handleAnalyze = async () => {
        if (!messages.filter(m => m.message).length) return;
        setIsAnalyzing(true);
        setShowAnalysis(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeConversation(messages.filter(m => m.message));
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const selectedConversation = conversations.find(c => c.customer_phone === selectedPhone);

    const handlePageChange = useCallback(async (newPage: number, currentSearch: string = searchQuery) => {
        setConvLoading(true);
        const result = await getConversations(currentSearch, newPage, limit);
        setConversations(result.conversations);
        setTotalCount(result.totalCount);
        setPage(newPage);
        setConvLoading(false);
    }, [searchQuery, limit]);

    // Server-side search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            handlePageChange(1, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, handlePageChange]);

    useEffect(() => {
        if (selectedPhone) {
            setLoading(true);
            getCustomerMessages(selectedPhone).then((msgs) => {
                setMessages(msgs);
                setLoading(false);
            });
        }
    }, [selectedPhone]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
            {/* Sidebar */}
            <div className="w-96 border-r border-border/30 flex flex-col">
                <div className="p-4 border-b border-border/30 space-y-4">
                    <h2 className="font-semibold text-lg">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="To search..."
                            className="pl-8 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:bg-background transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className={cn("flex flex-col gap-1 p-2", convLoading && "opacity-50 pointer-events-none")}>
                        {conversations.map((conv) => (
                            <button
                                key={conv.customer_phone}
                                onClick={() => setSelectedPhone(conv.customer_phone)}
                                className={cn(
                                    "flex items-start gap-3 py-4 pl-4 pr-3 text-start transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border/40 last:border-0",
                                    selectedPhone === conv.customer_phone && "bg-slate-100 dark:bg-slate-800 border-transparent"
                                )}
                            >
                                <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                                    <AvatarFallback className="font-semibold text-sm bg-indigo-100 text-indigo-700">{conv.customer_name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-foreground text-[15px] truncate pr-2">{conv.customer_name || conv.customer_phone}</span>
                                        <span className="text-[11px] font-medium text-muted-foreground/70 whitespace-nowrap">
                                            {conv.last_message_time && <ClientOnlyDate date={conv.last_message_time} />}
                                        </span>
                                    </div>
                                    <p dir="auto" className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed break-words w-full">
                                        {conv.last_message}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
                {/* Pagination Footer */}
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
            </div >

            {/* Chat Window */}
            < div className="flex-1 flex flex-col relative" >
                {
                    selectedPhone ? (
                        <>
                            {/* Chat Header */}
                            < div className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur" >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{selectedConversation?.customer_name?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">{selectedConversation?.customer_name || selectedConversation?.customer_phone}</h3>
                                        <p className="text-xs text-muted-foreground">{selectedConversation?.customer_phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 ml-2"
                                        onClick={handleAnalyze}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        AI Analyze
                                    </Button>
                                </div>
                            </div >

                            {/* Messages Area */}
                            < ScrollArea className="flex-1 p-6" >
                                <div className="flex flex-col gap-4">
                                    {messages.filter(m => m.message).map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col gap-1 px-5 py-3.5 text-[15px] shadow-sm max-w-[85%] leading-relaxed",
                                                msg.direction === 'outbound'
                                                    ? "ml-auto bg-primary text-primary-foreground rounded-[20px] rounded-tr-md"
                                                    : "bg-white dark:bg-card border-none rounded-[20px] rounded-tl-md text-foreground"
                                            )}
                                        >
                                            {(() => {
                                                // Helper to parse message content
                                                // content format can be "filename - url" or "filename – url" (en-dash)
                                                // We split by " - " or " – "
                                                const parts = msg.message.split(/ [–-] /);
                                                const url = parts.length > 1 ? parts[parts.length - 1] : msg.message;
                                                const fileName = parts.length > 1 ? parts.slice(0, parts.length - 1).join(' - ') : (url.split('/').pop()?.split('?')[0] || 'Attachment');

                                                if (msg.message_type === 'image' || msg.message_type === 'sticker') {
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

                                                if (msg.message_type === 'file' || msg.message_type === 'audio' || msg.message_type === 'video') {
                                                    return (
                                                        <div className="flex items-center gap-3 p-1">
                                                            <div className={cn(
                                                                "p-2.5 rounded-xl shrink-0",
                                                                msg.direction === 'outbound' ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                                                            )}>
                                                                {msg.message_type === 'audio' ? <PlayIcon className="h-5 w-5" /> :
                                                                    msg.message_type === 'video' ? <Video className="h-5 w-5" /> :
                                                                        <FileIcon className="h-5 w-5" />}
                                                            </div>
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={cn(
                                                                    "text-sm underline underline-offset-2 break-all line-clamp-2 hover:opacity-80",
                                                                    msg.direction === 'outbound' ? "text-primary-foreground" : "text-blue-600 dark:text-blue-400"
                                                                )}
                                                            >
                                                                {fileName}
                                                            </a>
                                                        </div>
                                                    );
                                                }

                                                if (msg.message_type === 'location') {
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
                                                        {msg.message}
                                                    </p>
                                                );
                                            })()}
                                            <span className={cn(
                                                "text-[10px] self-end opacity-70 mt-1 font-medium",
                                                msg.direction === 'outbound' ? "text-primary-foreground" : "text-muted-foreground"
                                            )}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    {loading && <div className="text-center text-sm text-muted-foreground animate-pulse">Loading conversation...</div>}
                                </div>
                            </ScrollArea >


                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 gap-4">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">AIVA Chat Assistant</h3>
                                <p className="max-w-[250px] text-sm">Select a conversation from the sidebar to view detailed message history and respond to customers.</p>
                            </div>
                        </div>
                    )
                }

                {/* AI Analysis Overlay */}
                {
                    showAnalysis && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                            <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 border-indigo-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b bg-muted/10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-100 rounded-full">
                                            <Sparkles className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <CardTitle className="text-base">Conversation Analysis</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAnalysis(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                            <p className="text-sm text-muted-foreground font-medium animate-pulse">Analyzing conversation context...</p>
                                        </div>
                                    ) : analysisResult ? (
                                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid gap-4">
                                                <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-2">
                                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900/60">Summary</h4>
                                                    <p className="text-sm text-indigo-950 leading-relaxed">{analysisResult.summary}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-lg border bg-card space-y-2">
                                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sentiment</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant={analysisResult.sentiment === 'positive' ? 'default' : analysisResult.sentiment === 'negative' ? 'destructive' : 'secondary'} className="uppercase">
                                                                {analysisResult.sentiment}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-lg border bg-card space-y-2">
                                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</h4>
                                                        <div className="flex items-end gap-1">
                                                            <span className="text-2xl font-bold">{analysisResult.sentimentScore}</span>
                                                            <span className="text-xs text-muted-foreground mb-1">/10</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {analysisResult.actionItems && Array.isArray(analysisResult.actionItems) && analysisResult.actionItems.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                            Recommended Actions
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {analysisResult.actionItems.map((item, i) => (
                                                                <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                                            <AlertCircle className="h-8 w-8 text-destructive/50" />
                                            <p>Failed to generate analysis</p>
                                            <Button variant="outline" size="sm" onClick={handleAnalyze}>Try Again</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
