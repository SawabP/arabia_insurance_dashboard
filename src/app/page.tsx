import { getDashboardStats, getChatVolumeData, getRecentInteractions, getPeakActivityData, getKpiTrends, getLeadTrends } from '@/app/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewCharts } from '@/components/dashboard/overview-charts';
import { MessageSquare, Users, ArrowDownLeft, ArrowUpRight, AlertTriangle, Zap, CheckCircle2, TrendingUp, Percent, Target, Headset } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { RecentInteractions } from '@/components/dashboard/recent-interactions';
import { Sparkline } from '@/components/dashboard/sparkline';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';

interface DashboardPageProps {
    searchParams: {
        startDate?: string;
        endDate?: string;
        channel?: string;
    }
}

export const dynamic = 'force-dynamic';

const DASHBOARD_TOOLTIPS = {
    totalMessages: 'Total number of chat messages recorded in the selected date range and channel.',
    totalCustomers: 'Number of distinct customers in the selected range.',
    escalationRate: 'Percentage of unique customers whose conversations were handed over to a human agent.',
    resolutionRate: 'Percentage of unique customers automatically handled without a human handover.',
    outputConversion: 'Percentage of unique customers who became high-intent leads.',
    inbound: 'Messages sent by customers into the system.',
    outbound: 'Messages sent by the system back to customers.',
    avgEngagement: 'Average number of messages per unique customer.',
    messageVolumeTrend: 'Daily message counts over the selected period.',
    peakActivityHours: 'Message counts grouped by hour of day (0-23) across the selected period.',
    recentConversations: 'Latest conversation summaries returned by the backend conversations endpoint.',
} as const;

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = searchParams.startDate ? new Date(searchParams.startDate) : thirtyDaysAgo;
    startDate.setHours(0, 0, 0, 0);

    const endDate = searchParams.endDate ? new Date(searchParams.endDate) : today;
    endDate.setHours(23, 59, 59, 999);

    const channel = searchParams.channel || 'all';

    const [stats, volumeData, peakData, recentInteractions, kpiTrends, leadTrends] = await Promise.all([
        getDashboardStats(startDate, endDate, channel),
        getChatVolumeData(startDate, endDate, channel),
        getPeakActivityData(startDate, endDate, channel),
        getRecentInteractions(channel),
        getKpiTrends(startDate, endDate, channel),
        getLeadTrends(startDate, endDate, channel)
    ]);

    return (
        <DashboardPageShell>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="relative overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">TOTAL MESSAGES</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.totalMessages} />
                                </div>
                                <Sparkline data={kpiTrends} dataKey="total" color="#6366f1" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.totalChats.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">TOTAL CUSTOMERS</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.totalCustomers} />
                                </div>
                                <Sparkline data={kpiTrends} dataKey="active" color="#8b5cf6" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.activeUsers.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <Headset className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">HANDOVER RATE</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.escalationRate} />
                                </div>
                                <Sparkline data={kpiTrends} dataKey="escalated" color="#6366f1" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.escalationRate}%</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-600 group bg-emerald-50/10 dark:bg-emerald-950/10 transition-all hover:bg-emerald-50/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                <Percent className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">AUTOMATED HANDLING RATE</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.resolutionRate} />
                                </div>
                                <Sparkline data={kpiTrends} dataKey="total" color="#059669" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.resolutionRate}%</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600 group bg-blue-50/10 dark:bg-blue-950/10 transition-all hover:bg-blue-50/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <Target className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">LEAD CONVERSION</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.outputConversion} />
                                </div>
                                <Sparkline data={leadTrends} dataKey="count" color="#2563eb" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.leadConversionRate}% <span className="text-xs font-normal text-muted-foreground ml-1">({stats.totalLeads} Leads)</span></h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-slate-500 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-slate-500/10 rounded-lg text-slate-600 transition-colors group-hover:bg-slate-500 group-hover:text-white">
                                <ArrowDownLeft className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">INBOUND</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.inbound} />
                                </div>
                                <Sparkline data={kpiTrends} dataKey="inbound" color="#64748b" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.inbound.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-slate-500 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-slate-500/10 rounded-lg text-slate-600 transition-colors group-hover:bg-slate-500 group-hover:text-white">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">OUTBOUND</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.outbound} />
                                </div>
                                <Sparkline data={kpiTrends} dataKey="outbound" color="#3b82f6" className="h-6 w-20" />
                            </div>
                            <h3 className="text-3xl font-black">{stats.outbound.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-1">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                                <Zap className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">AVG ENGAGEMENT</p>
                                    <InfoTooltip content={DASHBOARD_TOOLTIPS.avgEngagement} />
                                </div>
                                <div className="h-6 w-20" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black">{stats.avgMessagesPerCustomer}</h3>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">msgs / cust</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Message Volume Trend</CardTitle>
                        <div className="flex items-center gap-2">
                            <InfoTooltip content={DASHBOARD_TOOLTIPS.messageVolumeTrend} align="end" />
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <OverviewCharts volumeData={volumeData} type="volume" />
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Peak Activity Hours</CardTitle>
                        <div className="flex items-center gap-2">
                            <InfoTooltip content={DASHBOARD_TOOLTIPS.peakActivityHours} align="end" />
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <OverviewCharts peakData={peakData} type="peak" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1">
                <Card>
                    <CardHeader className="py-4 border-b bg-muted/10">
                        <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest">Recent Conversations</CardTitle>
                            <InfoTooltip content={DASHBOARD_TOOLTIPS.recentConversations} align="end" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecentInteractions interactions={recentInteractions} />
                    </CardContent>
                </Card>
            </div>
        </DashboardPageShell>
    );
}
