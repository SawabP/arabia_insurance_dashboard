import { getDashboardStats, getChatVolumeData, getIntentDistribution, getRecentInteractions, getPeakActivityData, getMessageTypeDistribution, getKpiTrends, getAIQualityMetrics, getQualityTrends, getLeadTrends } from '@/app/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewCharts } from '@/components/dashboard/overview-charts';
import { MessageSquare, Users, ArrowDownLeft, ArrowUpRight, AlertTriangle, Zap, Activity, Database, CheckCircle2, TrendingUp, Star, Percent, Target, BarChart3 } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { RecentInteractions } from '@/components/dashboard/recent-interactions';
import { Sparkline } from '@/components/dashboard/sparkline';
import { QualityScoring } from '@/components/dashboard/quality-scoring';
import { AIInsights } from '@/components/dashboard/ai-insights';

import { ChannelSelector } from '@/components/dashboard/channel-selector';

interface DashboardPageProps {
    searchParams: {
        startDate?: string;
        endDate?: string;
        channel?: string;
    }
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = searchParams.startDate ? new Date(searchParams.startDate) : thirtyDaysAgo;
    startDate.setHours(0, 0, 0, 0);

    const endDate = searchParams.endDate ? new Date(searchParams.endDate) : today;
    endDate.setHours(23, 59, 59, 999);

    const channel = searchParams.channel || 'all';

    const [stats, volumeData, intentData, peakData, distributionData, recentInteractions, kpiTrends, qualityMetrics, qualityTrends, leadTrends] = await Promise.all([
        getDashboardStats(startDate, endDate, channel),
        getChatVolumeData(startDate, endDate, channel),
        getIntentDistribution(startDate, endDate, channel),
        getPeakActivityData(startDate, endDate, channel),
        getMessageTypeDistribution(startDate, endDate, channel),
        getRecentInteractions(channel),
        getKpiTrends(startDate, endDate, channel),
        getAIQualityMetrics(startDate, endDate, channel),
        getQualityTrends(startDate, endDate, channel),
        getLeadTrends(startDate, endDate, channel)
    ]);

    return (
        <div className="flex-1 space-y-6 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">AIVA Control Center</h2>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            DB: Connected
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            AI Services: Healthy
                        </div>
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                            <Activity className="h-3 w-3" />
                            AI Health: {qualityMetrics.qualityScore}%
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ChannelSelector />
                    <DateRangePicker />
                </div>
            </div>

            {/* Stats Cards - Core Volume */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Total Messages */}
                <Card className="relative overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">TOTAL MESSAGES</p>
                                <Sparkline data={kpiTrends} dataKey="total" color="#6366f1" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.totalChats.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Customers */}
                <Card className="relative overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">TOTAL CUSTOMERS</p>
                                <Sparkline data={kpiTrends} dataKey="active" color="#8b5cf6" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.activeUsers.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Escalation Rate */}
                <Card className="border-l-4 border-l-amber-500 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">ESCALATION RATE</p>
                                <Sparkline data={kpiTrends} dataKey="escalated" color="#f59e0b" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.escalationRate}%</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* AI QUALITY INDEX (New) */}
                <Card className="border-l-4 border-l-indigo-600 group bg-indigo-50/10 dark:bg-indigo-950/10 transition-all hover:bg-indigo-50/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                <Star className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">NEW</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">AI QUALITY INDEX</p>
                                <Sparkline data={qualityTrends} dataKey="score" color="#4f46e5" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{qualityMetrics.qualityScore}/100</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* RESOLUTION RATE (New) */}
                <Card className="border-l-4 border-l-emerald-600 group bg-emerald-50/10 dark:bg-emerald-950/10 transition-all hover:bg-emerald-50/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                <Percent className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">RESOLUTION RATE</p>
                                <Sparkline data={qualityTrends} dataKey="score" color="#059669" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{qualityMetrics.resolutionRate}%</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* OUTPUT CONVERSION (New) */}
                <Card className="border-l-4 border-l-blue-600 group bg-blue-50/10 dark:bg-blue-950/10 transition-all hover:bg-blue-50/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <Target className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">OUTPUT CONVERSION</p>
                                <Sparkline data={leadTrends} dataKey="count" color="#2563eb" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{qualityMetrics.leadConversionRate}% <span className="text-xs font-normal text-muted-foreground ml-1">({qualityMetrics.totalLeads} Leads)</span></h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Inbound */}
                <Card className="border-l-4 border-l-slate-500 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-slate-500/10 rounded-lg text-slate-600 transition-colors group-hover:bg-slate-500 group-hover:text-white">
                                <ArrowDownLeft className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">INBOUND</p>
                                <Sparkline data={kpiTrends} dataKey="inbound" color="#64748b" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.inbound.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                {/* Outbound */}
                <Card className="border-l-4 border-l-slate-500 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-slate-500/10 rounded-lg text-slate-600 transition-colors group-hover:bg-slate-500 group-hover:text-white">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">OUTBOUND</p>
                                <Sparkline data={kpiTrends} dataKey="outbound" color="#3b82f6" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.outbound.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>


                {/* Avg Engagement */}
                <Card className="border-l-4 border-l-indigo-500 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                                <Zap className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">AVG ENGAGEMENT</p>
                                <div className="h-6 w-20" /> {/* Placeholder to maintain alignment */}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black">{stats.avgMessagesPerCustomer}</h3>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">msgs / cust</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Strategic Outcomes Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <QualityScoring metrics={qualityMetrics} trends={qualityTrends} />
                <AIInsights metrics={qualityMetrics} topIntents={intentData} stats={stats} />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Message Volume Trend</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <OverviewCharts volumeData={volumeData} type="volume" />
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Top Intents</CardTitle>
                        <Target className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <OverviewCharts intentData={intentData} type="intent" />
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Peak Activity Hours</CardTitle>
                        <Zap className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <OverviewCharts peakData={peakData} type="peak" />
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Message Types</CardTitle>
                        <BarChart3 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <OverviewCharts distributionData={distributionData} type="distribution" />
                    </CardContent>
                </Card>
            </div>

            {/* Notifications & Recent Activity */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                <Card className="lg:col-span-8">
                    <CardHeader className="py-4 border-b bg-muted/10">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">Recent Human Escalations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecentInteractions interactions={recentInteractions} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4">
                    <CardHeader className="py-4 border-b bg-muted/10">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">System Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {stats.recentNotifications.map((note: any, i: number) => (
                                <div key={i} className="flex items-start gap-4 text-sm">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-medium">{note.message}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(note.notified_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
